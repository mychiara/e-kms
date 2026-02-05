/**
 * E-KMS POSYANDU - GOOGLE APPS SCRIPT
 * Backend API untuk menghubungkan aplikasi web dengan Google Spreadsheet
 *
 * CARA SETUP:
 * 1. Buka Google Spreadsheet Anda
 * 2. Klik Extensions > Apps Script
 * 3. Hapus semua kode default
 * 4. Copy-paste seluruh kode ini
 * 5. Ganti SPREADSHEET_ID dengan ID spreadsheet Anda
 * 6. Klik Deploy > New deployment
 * 7. Pilih type: Web app
 * 8. Execute as: Me
 * 9. Who has access: Anyone
 * 10. Deploy dan copy URL-nya
 * 11. Paste URL tersebut ke file config.js di aplikasi
 */

// ===== KONFIGURASI =====
const SPREADSHEET_ID = "GANTI_DENGAN_ID_SPREADSHEET_ANDA"; // Ganti dengan ID spreadsheet Anda
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

// ===== FUNGSI UTAMA =====

/**
 * Fungsi doGet - Dipanggil saat ada HTTP GET request
 * Wajib ada untuk Web App
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "success",
      message: "E-KMS API is running!",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fungsi doPost - Dipanggil saat ada HTTP POST request
 * Ini adalah fungsi utama yang menangani semua request dari aplikasi
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    Logger.log("Received action: " + action);
    Logger.log("Data: " + JSON.stringify(data));

    let result;

    switch (action) {
      case "execute":
        result = executeQuery(data.query, data.params || []);
        break;
      case "batch":
        result = executeBatch(data.queries || []);
        break;
      default:
        result = { status: "error", message: "Unknown action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Execute single query
 */
function executeQuery(query, params) {
  try {
    Logger.log("Executing query: " + query);
    Logger.log("Params: " + JSON.stringify(params));

    const queryUpper = query.trim().toUpperCase();

    if (queryUpper.startsWith("SELECT")) {
      return handleSelect(query, params);
    } else if (queryUpper.startsWith("INSERT")) {
      return handleInsert(query, params);
    } else if (queryUpper.startsWith("UPDATE")) {
      return handleUpdate(query, params);
    } else if (queryUpper.startsWith("DELETE")) {
      return handleDelete(query, params);
    } else {
      return { status: "error", message: "Unsupported query type" };
    }
  } catch (error) {
    Logger.log("Error in executeQuery: " + error.toString());
    return { status: "error", message: error.toString() };
  }
}

/**
 * Execute batch queries
 */
function executeBatch(queries) {
  const results = [];
  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    results.push(executeQuery(q.query, q.params || []));
  }
  return { status: "success", results: results };
}

/**
 * Handle SELECT query
 */
function handleSelect(query, params) {
  try {
    // Parse table name
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    if (!tableMatch) {
      return {
        status: "error",
        message: "Invalid SELECT query - no table specified",
      };
    }

    const tableName = tableMatch[1];
    const sheet = ss.getSheetByName(tableName);

    if (!sheet) {
      return { status: "error", message: "Sheet not found: " + tableName };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      return { status: "success", data: [] };
    }

    const headers = data[0];
    const rows = data.slice(1);

    // Convert to objects
    let results = rows.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    // Apply WHERE clause if exists
    const whereMatch = query.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      results = applyWhereClause(results, whereClause, params);
    }

    // Apply ORDER BY if exists
    const orderMatch = query.match(/ORDER BY\s+(\w+)\s*(ASC|DESC)?/i);
    if (orderMatch) {
      const orderField = orderMatch[1];
      const orderDir = orderMatch[2] || "ASC";
      results.sort((a, b) => {
        if (orderDir.toUpperCase() === "DESC") {
          return b[orderField] > a[orderField] ? 1 : -1;
        } else {
          return a[orderField] > b[orderField] ? 1 : -1;
        }
      });
    }

    // Apply LIMIT if exists
    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      results = results.slice(0, parseInt(limitMatch[1]));
    }

    return { status: "success", data: results };
  } catch (error) {
    Logger.log("Error in handleSelect: " + error.toString());
    return { status: "error", message: error.toString() };
  }
}

/**
 * Handle INSERT query
 */
function handleInsert(query, params) {
  try {
    // Parse table name
    const tableMatch = query.match(/INTO\s+(\w+)/i);
    if (!tableMatch) {
      return {
        status: "error",
        message: "Invalid INSERT query - no table specified",
      };
    }

    const tableName = tableMatch[1];
    const sheet = ss.getSheetByName(tableName);

    if (!sheet) {
      return { status: "error", message: "Sheet not found: " + tableName };
    }

    // Get headers
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    // Parse column names from query
    const columnsMatch = query.match(/\(([^)]+)\)\s+VALUES/i);
    if (!columnsMatch) {
      return {
        status: "error",
        message: "Invalid INSERT query - no columns specified",
      };
    }

    const columns = columnsMatch[1].split(",").map((c) => c.trim());

    // Create new row
    const newRow = new Array(headers.length).fill("");

    // Generate new ID
    const lastRow = sheet.getLastRow();
    const newId =
      lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;

    // Fill data
    columns.forEach((col, index) => {
      const headerIndex = headers.indexOf(col);
      if (headerIndex !== -1) {
        if (col === "id") {
          newRow[headerIndex] = newId;
        } else {
          newRow[headerIndex] =
            params[index] !== undefined ? params[index] : "";
        }
      }
    });

    // Append row
    sheet.appendRow(newRow);

    Logger.log("Inserted new row with ID: " + newId);

    return {
      status: "success",
      message: "Data inserted successfully",
      insertId: newId,
    };
  } catch (error) {
    Logger.log("Error in handleInsert: " + error.toString());
    return { status: "error", message: error.toString() };
  }
}

/**
 * Handle UPDATE query
 */
function handleUpdate(query, params) {
  try {
    Logger.log("=== HANDLE UPDATE ===");
    Logger.log("Query: " + query);
    Logger.log("Params: " + JSON.stringify(params));

    // Parse table name
    const tableMatch = query.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch) {
      return {
        status: "error",
        message: "Invalid UPDATE query - no table specified",
      };
    }

    const tableName = tableMatch[1];
    Logger.log("Table: " + tableName);

    const sheet = ss.getSheetByName(tableName);

    if (!sheet) {
      return { status: "error", message: "Sheet not found: " + tableName };
    }

    // Get headers
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    Logger.log("Headers: " + JSON.stringify(headers));

    // Parse SET clause
    const setMatch = query.match(/SET\s+(.+?)\s+WHERE/i);
    if (!setMatch) {
      return {
        status: "error",
        message: "Invalid UPDATE query - no SET clause",
      };
    }

    const setClause = setMatch[1];
    const setFields = setClause
      .split(",")
      .map((s) => s.trim().split("=")[0].trim());

    Logger.log("SET Fields: " + JSON.stringify(setFields));

    // Parse WHERE clause
    const whereMatch = query.match(/WHERE\s+(.+)$/i);
    if (!whereMatch) {
      return {
        status: "error",
        message: "Invalid UPDATE query - no WHERE clause",
      };
    }

    const whereClause = whereMatch[1].trim();
    Logger.log("WHERE Clause: " + whereClause);

    // Extract WHERE field (assuming format: "field=?")
    const whereFieldMatch = whereClause.match(/(\w+)\s*=\s*\?/);
    if (!whereFieldMatch) {
      return { status: "error", message: "Invalid WHERE clause format" };
    }

    const whereField = whereFieldMatch[1];
    const whereValue = params[params.length - 1]; // Last param is WHERE value
    Logger.log("WHERE: " + whereField + " = " + whereValue);

    // Get all data
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1);

    let updatedCount = 0;

    // Find WHERE field column index
    const whereFieldIndex = headers.indexOf(whereField);
    if (whereFieldIndex === -1) {
      return {
        status: "error",
        message: "WHERE field not found: " + whereField,
      };
    }

    Logger.log("WHERE Field Index: " + whereFieldIndex);

    // Find and update matching rows
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const rowValue = row[whereFieldIndex];

      Logger.log(
        "Row " +
          (rowIndex + 2) +
          ": " +
          whereField +
          " = " +
          rowValue +
          " (type: " +
          typeof rowValue +
          ")",
      );

      // Convert both to string for comparison
      if (String(rowValue) === String(whereValue)) {
        Logger.log("MATCH FOUND at row " + (rowIndex + 2));

        // Update fields
        for (let fieldIndex = 0; fieldIndex < setFields.length; fieldIndex++) {
          const field = setFields[fieldIndex];
          const headerIndex = headers.indexOf(field);

          if (headerIndex !== -1) {
            const newValue = params[fieldIndex];
            const actualRow = rowIndex + 2; // +2: header + 0-based index

            Logger.log(
              "Updating " +
                field +
                " at row " +
                actualRow +
                ", col " +
                (headerIndex + 1) +
                " to: " +
                newValue,
            );

            sheet.getRange(actualRow, headerIndex + 1).setValue(newValue);
          } else {
            Logger.log("WARNING: Field not found: " + field);
          }
        }
        updatedCount++;
      }
    }

    Logger.log("=== UPDATE COMPLETE ===");
    Logger.log("Updated " + updatedCount + " rows");

    if (updatedCount === 0) {
      Logger.log("WARNING: No rows updated. Check WHERE condition.");
    }

    return {
      status: "success",
      message: "Data updated successfully",
      affectedRows: updatedCount,
      rowCount: updatedCount,
    };
  } catch (error) {
    Logger.log("Error in handleUpdate: " + error.toString());
    Logger.log("Error stack: " + error.stack);
    return { status: "error", message: error.toString() };
  }
}

/**
 * Handle DELETE query
 */
function handleDelete(query, params) {
  try {
    // Parse table name
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    if (!tableMatch) {
      return {
        status: "error",
        message: "Invalid DELETE query - no table specified",
      };
    }

    const tableName = tableMatch[1];
    const sheet = ss.getSheetByName(tableName);

    if (!sheet) {
      return { status: "error", message: "Sheet not found: " + tableName };
    }

    // Parse WHERE clause
    const whereMatch = query.match(/WHERE\s+(.+)$/i);
    if (!whereMatch) {
      return {
        status: "error",
        message: "DELETE without WHERE is not allowed for safety",
      };
    }

    const whereClause = whereMatch[1].trim();

    // Get headers
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    // Get all data
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1);

    let deletedCount = 0;

    // Find and delete matching rows (from bottom to top to avoid index issues)
    for (let i = rows.length - 1; i >= 0; i--) {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = rows[i][index];
      });

      if (matchesWhereClause(obj, whereClause, params)) {
        sheet.deleteRow(i + 2); // +2 because: +1 for header, +1 for 0-based index
        deletedCount++;
      }
    }

    Logger.log("Deleted " + deletedCount + " rows");

    return {
      status: "success",
      message: "Data deleted successfully",
      affectedRows: deletedCount,
    };
  } catch (error) {
    Logger.log("Error in handleDelete: " + error.toString());
    return { status: "error", message: error.toString() };
  }
}

/**
 * Apply WHERE clause to results
 */
function applyWhereClause(results, whereClause, params) {
  return results.filter((row) => matchesWhereClause(row, whereClause, params));
}

/**
 * Check if row matches WHERE clause
 */
function matchesWhereClause(row, whereClause, params) {
  // Simple implementation - supports basic conditions
  // Format: "field = ?" or "field > ?" etc.

  let paramIndex = 0;
  let clause = whereClause;

  // Replace ? with actual values
  while (clause.indexOf("?") !== -1 && paramIndex < params.length) {
    const value = params[paramIndex];
    const replacement = typeof value === "string" ? "'" + value + "'" : value;
    clause = clause.replace("?", replacement);
    paramIndex++;
  }

  // Parse simple conditions
  const conditions = clause.split(/\s+AND\s+/i);

  for (let condition of conditions) {
    condition = condition.trim();

    // Handle different operators
    let match;
    if ((match = condition.match(/(\w+)\s*=\s*'([^']+)'/))) {
      if (row[match[1]] != match[2]) return false;
    } else if ((match = condition.match(/(\w+)\s*=\s*(\d+)/))) {
      if (row[match[1]] != match[2]) return false;
    } else if ((match = condition.match(/(\w+)\s*>\s*(\d+)/))) {
      if (!(row[match[1]] > parseFloat(match[2]))) return false;
    } else if ((match = condition.match(/(\w+)\s*<\s*(\d+)/))) {
      if (!(row[match[1]] < parseFloat(match[2]))) return false;
    } else if ((match = condition.match(/(\w+)\s*>=\s*(\d+)/))) {
      if (!(row[match[1]] >= parseFloat(match[2]))) return false;
    } else if ((match = condition.match(/(\w+)\s*<=\s*(\d+)/))) {
      if (!(row[match[1]] <= parseFloat(match[2]))) return false;
    } else if ((match = condition.match(/(\w+)\s*!=\s*'([^']+)'/))) {
      if (row[match[1]] == match[2]) return false;
    }
  }

  return true;
}

/**
 * Test function - untuk testing di Apps Script Editor
 */
function testAPI() {
  // Test SELECT
  const selectResult = executeQuery(
    "SELECT * FROM anak WHERE status_aktif = ?",
    [1],
  );
  Logger.log("SELECT Result: " + JSON.stringify(selectResult));

  // Test INSERT
  const insertResult = executeQuery(
    "INSERT INTO anak (nama, nik, tgl_lahir, jenis_kelamin, nama_ibu, alamat, berat_lahir, status_aktif, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      "Test Anak",
      "1234567890123456",
      "2020-01-01",
      "L",
      "Test Ibu",
      "Test Alamat",
      3.2,
      1,
      new Date().toISOString(),
    ],
  );
  Logger.log("INSERT Result: " + JSON.stringify(insertResult));
}
