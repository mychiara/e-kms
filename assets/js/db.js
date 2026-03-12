class Database {
  constructor() {
    this.mode = CONFIG.DB_MODE || "spreadsheet";
    if (this.mode === "firestore") {
      try {
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
          firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
        }
        this.fs = firebase.firestore();
        console.log("[DB] Firestore Initialized Mode: " + this.mode);
      } catch (e) {
        console.error("[DB] Firestore Init Error:", e);
      }
    }
    this.apiUrl = CONFIG.GOOGLE_SCRIPT_URL;
  }

  async execute(sql, params = []) {
    if (this.mode === "firestore") {
      return await this.executeFirestore(sql, params);
    }

    document.getElementById("loader").style.display = "flex";
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(this.apiUrl, {
          method: "POST",
          body: JSON.stringify({
            action: "execute",
            query: sql,
            params: params,
          }),
        });
        const result = await response.json();
        document.getElementById("loader").style.display = "none";
        return result;
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          document.getElementById("loader").style.display = "none";
          return {
            status: "error",
            message: "Connection Failed: " + error.message,
          };
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  async executeFirestore(sql, params = []) {
    document.getElementById("loader").style.display = "flex";
    try {
      const sqlClean = sql.trim().replace(/\s+/g, " ");
      const firstWord = sqlClean.split(" ")[0].toUpperCase();

      let result;
      if (firstWord === "SELECT") {
        const data = await this._handleFirestoreSelect(sqlClean, params);
        result = { status: "success", data: data };
      } else if (firstWord === "INSERT") {
        result = await this._handleFirestoreInsert(sqlClean, params);
      } else if (firstWord === "UPDATE") {
        result = await this._handleFirestoreUpdate(sqlClean, params);
      } else if (firstWord === "DELETE") {
        result = await this._handleFirestoreDelete(sqlClean, params);
      } else {
        throw new Error("Unsupported SQL: " + firstWord);
      }

      document.getElementById("loader").style.display = "none";
      return result;
    } catch (error) {
      console.error("Firestore Error:", error, sql);
      document.getElementById("loader").style.display = "none";
      return { status: "error", message: error.message };
    }
  }

  async _handleFirestoreSelect(sql, params) {
    // --- 1. HANDLING JOINS (FOR DASHBOARD & ALERTS) ---
    if (sql.toUpperCase().includes("JOIN")) {
      return await this._handleFirestoreJoin(sql, params);
    }

    // --- 2. REGULAR SELECT ---
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    if (!fromMatch) throw new Error("Table not found");
    const table = fromMatch[1];

    try {
      let query = this.fs.collection(table);

      // Filter WHERE
      const whereSection = sql.match(/WHERE\s+(.*?)(\s+ORDER BY|\s+LIMIT|$)/i);
      let conditions = [];
      if (whereSection) {
        const conditionStr = whereSection[1].trim();

        // Handle "id = ?"
        if (
          conditionStr.toLowerCase().startsWith("id = ?") ||
          conditionStr.toLowerCase().startsWith("id=?")
        ) {
          const idVal = params[0];
          if (idVal) {
            const doc = await query.doc(idVal.toString()).get();
            return doc.exists ? [{ ...doc.data(), id: doc.id }] : [];
          }
          return [];
        }

        // Simple split by AND
        conditions = conditionStr.split(/\s+AND\s+/i);
        let paramIdx = 0;

        for (const cond of conditions) {
          const parts = cond.split("=");
          if (parts.length === 2) {
            const col = parts[0].trim();
            const valRaw = parts[1].trim();
            let val;

            if (valRaw === "?") {
              val = params[paramIdx++];
            } else {
              val = valRaw.replace(/['"]/g, "");
              if (!isNaN(val) && val !== "") val = Number(val);
            }
            query = query.where(col, "==", val);
          }
        }
      }

      // Handle ORDER BY
      const orderMatch = sql.match(/ORDER BY\s+([\w.]+)\s*(ASC|DESC)?/i);
      let orderByInfo = null;
      if (orderMatch) {
        const col = orderMatch[1].split(".").pop();
        const dir =
          (orderMatch[2] || "ASC").toUpperCase() === "DESC" ? "desc" : "asc";
        query = query.orderBy(col, dir);
        orderByInfo = { col, dir };
      }

      // Handle LIMIT
      const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        query = query.limit(parseInt(limitMatch[1]));
      }

      // Try executing native Firestore query
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    } catch (e) {
      // --- FALLBACK: IN-MEMORY FILTER/SORT ---
      // Fire when "The query requires an index" error occurs
      console.warn(
        "[DB] Firestore query failed, falling back to in-memory processing. Error:",
        e.message,
      );

      const snapshot = await this.fs.collection(table).get();
      let results = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

      // 1. Filter in memory
      const whereSection = sql.match(/WHERE\s+(.*?)(\s+ORDER BY|\s+LIMIT|$)/i);
      if (whereSection) {
        const conditions = whereSection[1].trim().split(/\s+AND\s+/i);
        let pIdx = 0;
        conditions.forEach((cond) => {
          const parts = cond.split("=");
          if (parts.length === 2) {
            const col = parts[0].trim();
            let val = parts[1].trim();
            if (val === "?") val = params[pIdx++];
            else {
              val = val.replace(/['"]/g, "");
              if (!isNaN(val) && val !== "") val = Number(val);
            }

            results = results.filter((item) => {
              let itemVal = item[col];
              // Type matching
              if (typeof val === "number") return Number(itemVal) === val;
              return String(itemVal) === String(val);
            });
          }
        });
      }

      // 2. Sort in memory
      const orderMatch = sql.match(/ORDER BY\s+([\w.]+)\s*(ASC|DESC)?/i);
      if (orderMatch) {
        const col = orderMatch[1].split(".").pop();
        const dir = (orderMatch[2] || "ASC").toUpperCase();
        results.sort((a, b) => {
          let va = a[col],
            vb = b[col];
          if (va < vb) return dir === "DESC" ? 1 : -1;
          if (va > vb) return dir === "DESC" ? -1 : 1;
          return 0;
        });
      }

      // 3. Limit in memory
      const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        results = results.slice(0, parseInt(limitMatch[1]));
      }

      return results;
    }
  }

  /**
   * Optimized JOIN handler for Firestore
   * Currently supports: 1 level JOIN
   */
  async _handleFirestoreJoin(sql, params) {
    // Pattern: SELECT ... FROM table1 JOIN table2 ON table1.id = table2.ref_id
    const match = sql.match(
      /FROM\s+(\w+)\s+(?:as\s+)?(\w+)?\s*JOIN\s+(\w+)\s+(?:as\s+)?(\w+)?\s*ON\s+(.*?)($|\s+ORDER BY|\s+LIMIT)/i,
    );
    if (!match) throw new Error("Complex JOIN not supported");

    const t1Name = match[1];
    const t2Name = match[3];
    const onClause = match[5];

    // Fetch both collections
    const [s1, s2] = await Promise.all([
      this.fs.collection(t1Name).get(),
      this.fs.collection(t2Name).get(),
    ]);

    const data1 = s1.docs.map((d) => ({ ...d.data(), id: d.id }));
    const data2 = s2.docs.map((d) => ({ ...d.data(), id: d.id }));

    // Simple Join execution in memory
    // Pattern usually: a.anak_id = k.id (Alerts) or p.anak_id = a.id (Dashboard)
    const onParts = onClause.split("=");
    const leftKey = onParts[0].trim().split(".").pop();
    const rightKey = onParts[1].trim().split(".").pop();

    const results = data1.map((item1) => {
      const matchItem = data2.find(
        (item2) =>
          item2[rightKey] == item1[leftKey] ||
          item1[rightKey] == item2[leftKey],
      );
      if (matchItem) {
        return { ...item1, ...matchItem, id: item1.id }; // Keep primary ID
      }
      return item1;
    });

    // Apply Order By manually in memory if needed
    if (sql.includes("ORDER BY")) {
      const orderMatch = sql.match(/ORDER BY\s+([\w.]+)\s*(ASC|DESC)?/i);
      const col = orderMatch[1].split(".").pop();
      const dir = (orderMatch[2] || "ASC").toUpperCase();
      results.sort((a, b) => {
        if (a[col] < b[col]) return dir === "DESC" ? 1 : -1;
        if (a[col] > b[col]) return dir === "DESC" ? -1 : 1;
        return 0;
      });
    }

    // Apply Limit
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) return results.slice(0, parseInt(limitMatch[1]));

    return results;
  }

  async _handleFirestoreInsert(sql, params) {
    const tableMatch = sql.match(/INSERT INTO\s+(\w+)/i);
    const colMatch = sql.match(/\((.*?)\)/);
    if (!tableMatch || !colMatch) throw new Error("Invalid INSERT");

    const table = tableMatch[1];
    const cols = colMatch[1].split(",").map((c) => c.trim());
    const data = {};
    cols.forEach((col, i) => {
      let val = params[i];
      // Auto-convert numbers for better Firestore querying
      if (typeof val === "string" && !isNaN(val) && val.trim() !== "") {
        val = Number(val);
      }
      data[col] = val;
    });

    // Ensure created_at if missing
    if (!data.created_at) data.created_at = new Date().toISOString();

    const docRef = await this.fs.collection(table).add(data);

    // Invalidate Cache after insert (optional but good for UX)
    if (window.cacheManager) {
      const cacheKey = table + "_list";
      window.cacheManager.invalidate(cacheKey);
      window.cacheManager.invalidate("dashboard_" + table);
    }

    return { status: "success", id: docRef.id, rowCount: 1 };
  }

  async _handleFirestoreUpdate(sql, params) {
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
    const setMatch = sql.match(/SET\s+(.*?)\s+WHERE/i);
    const whereMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);

    if (!tableMatch || !setMatch || !whereMatch)
      throw new Error("Invalid UPDATE");

    const table = tableMatch[1];
    const setStr = setMatch[1];
    const cols = setStr.split(",").map((s) => s.trim().split("=")[0].trim());
    const id = params[params.length - 1];

    const data = {};
    cols.forEach((col, i) => {
      data[col] = params[i];
    });

    await this.fs.collection(table).doc(id.toString()).update(data);
    return { status: "success", rowCount: 1 };
  }

  async _handleFirestoreDelete(sql, params) {
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) throw new Error("Invalid DELETE");
    const table = tableMatch[1];
    const id = params[0];

    await this.fs.collection(table).doc(id.toString()).delete();
    return { status: "success", rowCount: 1 };
  }

  async query(sql, params = []) {
    const res = await this.execute(sql, params);
    return res && res.data ? res.data : [];
  }

  async fetch(sql, params = []) {
    const data = await this.query(sql, params);
    return data && data.length > 0 ? data[0] : null;
  }

  async log(action, details = "") {
    const user = localStorage.getItem("user_name") || "Guest";
    const logData = {
      username: user,
      action: action,
      details: details,
      created_at: new Date().toISOString(),
    };

    if (this.mode === "firestore") {
      this.fs.collection("activity_logs").add(logData);
    } else {
      this.execute(
        "INSERT INTO activity_logs (username, action, details) VALUES (?, ?, ?)",
        [user, action, details],
      );
    }
  }
}
const db = new Database();
