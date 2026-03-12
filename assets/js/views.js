/**
 * VIEW RENDERERS (PRODUCTION READY)
 */

// ========== PRINT KMS FUNCTION (MUST BE GLOBAL) ==========

/**
 * Print KMS for parents - opens browser print dialog
 * Parents can save as PDF using browser's "Save as PDF" option
 */
window.printKMS = () => {
  // Add print-specific styles temporarily
  const style = document.createElement("style");
  style.id = "print-styles";
  style.textContent = `
        @media print {
            /* Reset body for print */
            body {
                margin: 0 !important;
                padding: 0 !important;
                font-size: 11pt;
                background: white !important;
            }
            
            /* EXPLICITLY HIDE only UI elements */
            .sidebar,
            .top-header,
            .mobile-menu-btn,
            .sidebar-backdrop,
            .no-print {
                display: none !important;
                visibility: hidden !important;
            }
            
            /* EXPLICITLY SHOW content areas */
            #app,
            #page-content,
            #kmsContent {
                display: block !important;
                visibility: visible !important;
                position: static !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
            }
            
            /* Show print-only elements */
            .print-only {
                display: block !important;
                visibility: visible !important;
            }
            
            /* Optimize cards for print */
            .card {
                page-break-inside: avoid;
                box-shadow: none !important;
                border: 1px solid #ddd !important;
                margin-bottom: 1rem !important;
                background: white !important;
            }
            
            /* Better table printing */
            table {
                page-break-inside: avoid;
                width: 100%;
                border-collapse: collapse;
            }
            
            table th,
            table td {
                border: 1px solid #ddd;
                padding: 0.5rem;
            }
            
            /* Chart optimization */
            canvas {
                max-height: 300px !important;
                page-break-inside: avoid;
            }
            
            /* Preserve colors for print */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            /* Page setup */
            @page {
                margin: 1.5cm;
                size: A4 portrait;
            }
            
            /* Typography adjustments */
            h1 { 
                font-size: 20pt;
                page-break-after: avoid;
                margin-top: 0;
            }
            h2 { 
                font-size: 18pt;
                page-break-after: avoid;
            }
            h3 { 
                font-size: 16pt;
                page-break-after: avoid;
            }
            h4 { 
                font-size: 14pt;
                page-break-after: avoid;
            }
            
            /* Prevent orphans and widows */
            p, li {
                orphans: 3;
                widows: 3;
            }
            
            /* Badge and status elements */
            .badge {
                display: inline-block !important;
                border: 1px solid currentColor !important;
                padding: 0.25rem 0.5rem !important;
            }
            
            /* Ensure images and icons are visible */
            img, i, svg {
                display: inline-block !important;
            }
            
            /* FIX: Gradient backgrounds don't print well */
            /* Replace gradient with solid color for print */
            .card[style*="primary-gradient"] {
                background: #009b77 !important; /* Solid teal color */
                color: white !important;
            }
            
            /* Footer at bottom of last page */
            .card:last-child {
                page-break-after: auto;
            }
        }
    `;

  document.head.appendChild(style);

  // Small delay to ensure styles are applied and DOM is ready
  setTimeout(() => {
    window.print();

    // Remove print styles after printing
    setTimeout(() => {
      document.getElementById("print-styles")?.remove();
    }, 1000);
  }, 250);
};

console.log("[Print KMS] ✅ Function loaded and ready");

// --- GLOBAL HELPERS ---
window.helper_calculateDetailedAge = (birthDateStr) => {
  if (!birthDateStr) return "-";
  const birthDate = new Date(birthDateStr);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} Tahun`);
  if (months > 0) parts.push(`${months} Bulan`);
  if (days > 0 || parts.length === 0) parts.push(`${days} Hari`);

  return parts.join(" ");
};

// ========== VIEW RENDERERS ==========

// --- LOGIN ---
window.render_login = async () => {
  const content = document.getElementById("page-content");

  // Fetch latest schedules and announcements
  let jadwals = [];
  let pengumumans = [];
  try {
    const today = new Date().toLocaleDateString("en-CA");
    // Try to get upcoming schedules
    jadwals = await db.query(
      "SELECT * FROM jadwal_posyandu WHERE tgl_kegiatan >= ? ORDER BY tgl_kegiatan ASC LIMIT 3",
      [today],
    );
    // If no upcoming, show last 3
    if (jadwals.length === 0) {
      jadwals = await db.query(
        "SELECT * FROM jadwal_posyandu ORDER BY tgl_kegiatan DESC LIMIT 3",
      );
    }
    // Fetch active announcements
    pengumumans = await db.query(
      "SELECT * FROM pengumuman WHERE status = 'Aktif' ORDER BY created_at DESC LIMIT 3",
    );
  } catch (e) {
    console.error("Login Page Data Error:", e);
  }

  content.innerHTML = `
        <div class="auth-wrapper" style="display: flex; min-height: 100vh; width: 100vw; background: var(--primary); margin:0; padding:0;">
            <!-- LEFT: LOGIN FORM -->
            <div class="login-side" style="flex: 0 0 45%; background: white; display: flex; align-items: center; justify-content: center; padding: 2.5rem; box-shadow: 10px 0 50px rgba(0,0,0,0.1); z-index: 5;">
                <div class="card" style="width: 100%; max-width: 440px; padding: 3rem; border: none; border-radius: 20px; background: white; box-shadow: none;">
                    <div style="text-align: center; margin-bottom: 3rem;">
                        <div style="margin: 0 auto 1.5rem; width: 72px; height: 72px; border-radius: 16px; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; box-shadow: 0 10px 20px rgba(2, 132, 199, 0.2);">
                            <i class="fas fa-hand-holding-medical"></i>
                        </div>
                        <h2 style="font-family:'Plus Jakarta Sans'; font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem; font-weight: 800; letter-spacing: -1px;">E-KMS Portal</h2>
                        <p style="color: var(--txt-soft); font-size: 1rem; font-weight: 500;">Sistem Informasi & Monitoring Posyandu</p>
                    </div>
                    
                    <form id="loginForm">
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label style="font-weight: 700; font-size: 0.8rem; color: var(--txt-muted); text-transform: uppercase; letter-spacing: 0.05em;">Username / NIK</label>
                            <input type="text" id="username" required placeholder="Masukkan identifier" style="height: 56px; border-radius: 12px; border: 1px solid #e2e8f0; padding: 0 1.2rem; width: 100%;" autofocus>
                        </div>
                        <div class="form-group" style="margin-bottom: 2rem;">
                            <label style="font-weight: 700; font-size: 0.8rem; color: var(--txt-muted); text-transform: uppercase; letter-spacing: 0.05em;">Password</label>
                            <input type="password" id="password" required placeholder="••••••••" style="height: 56px; border-radius: 12px; border: 1px solid #e2e8f0; padding: 0 1.2rem; width: 100%;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; height: 56px; font-weight: 800; font-size: 1.1rem; border-radius: 14px; background: var(--accent); border: none; color: white; cursor: pointer; transition: all 0.3s;">
                            Masuk Ke Sistem
                        </button>
                    </form>
                    
                    <div style="margin-top: 2rem; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 1.5rem;">
                        <a href="#/cek_kms" class="btn btn-outline" style="width:100%; height:48px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; color: var(--txt-soft); font-weight: 600; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <i class="fas fa-search"></i> Cek KMS Publik (Tanpa Login)
                        </a>
                    </div>
                </div>
            </div>

            <!-- RIGHT: SCHEDULE & INFO (Hidden on mobile) -->
            <div class="schedule-side" style="flex: 1; background: var(--primary); padding: 4rem; display: flex; flex-direction: column; position: relative; overflow-y: auto; min-width: 0;">
                <!-- Decor -->
                <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(255, 255, 255, 0.05); border-radius: 50%; filter: blur(60px); pointer-events: none;"></div>
                
                <div style="position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem;">
                        <!-- SCHEDULE COLUMN -->
                        <div>
                            <h3 style="color:white; margin-bottom:1.5rem; font-size:1.1rem; text-transform:uppercase; letter-spacing:2px; display:flex; align-items:center; gap:0.75rem; font-weight: 800; opacity: 0.9;">
                                <i class="fas fa-calendar-alt" style="color: var(--accent);"></i> Jadwal Mendatang
                            </h3>
                            <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                                ${
                                  jadwals.length > 0
                                    ? jadwals
                                        .map((j) => {
                                          const date = new Date(j.tgl_kegiatan);
                                          return `
                                    <div class="card" style="padding: 1.25rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); color: white; border-radius: 16px; display: flex; align-items: center; gap: 1.25rem; transition: all 0.3s ease;">
                                        <div style="background: white; color: var(--primary); min-width: 56px; height: 56px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                                            <span style="font-size: 1.2rem; font-weight: 800; line-height: 1;">${date.getDate()}</span>
                                            <span style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">${date.toLocaleDateString("id-ID", { month: "short" })}</span>
                                        </div>
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="font-size: 0.65rem; color: rgba(255,255,255,0.6); font-weight: 700; text-transform: uppercase; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.3rem;">
                                                <i class="fas fa-user-edit" style="font-size: 0.6rem;"></i> ${j.author || "Admin"} &bull; ${j.posyandu || "Global"}
                                            </div>
                                            <h4 style="margin: 0; color: white; font-size: 0.95rem; font-family: 'Plus Jakarta Sans'; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${j.nama_kegiatan}</h4>
                                            <div style="margin-top: 0.4rem; display: flex; align-items: center; gap: 0.5rem; opacity: 0.8; font-size: 0.8rem;">
                                                <i class="fas fa-map-marker-alt" style="color: #fb7185;"></i> 
                                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${j.tempat || "-"}</span>
                                            </div>
                                        </div>
                                    </div>
                                  `;
                                        })
                                        .join("")
                                    : `<div style="color:rgba(255,255,255,0.5); font-style:italic;">Belum ada jadwal.</div>`
                                }
                            </div>
                        </div>

                        <!-- ANNOUNCEMENT COLUMN -->
                        <div>
                            <h3 style="color:white; margin-bottom:1.5rem; font-size:1.1rem; text-transform:uppercase; letter-spacing:2px; display:flex; align-items:center; gap:0.75rem; font-weight: 800; opacity: 0.9;">
                                <i class="fas fa-bullhorn" style="color: var(--accent);"></i> Pengumuman
                            </h3>
                            <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                                ${
                                  pengumumans.length > 0
                                    ? pengumumans
                                        .map((p) => {
                                          return `
                                    <div class="card" style="padding: 1.25rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 16px; transition: all 0.3s ease; backdrop-filter: blur(5px);">
                                        <div style="font-size: 0.65rem; color: rgba(255,255,255,0.5); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
                                            <i class="fas fa-id-card-clip" style="color: var(--accent);"></i> ${p.author || "Admin"} &bull; ${p.posyandu || "Global"}
                                        </div>
                                        <h4 style="margin: 0 0 0.6rem 0; font-size: 0.95rem; font-family: 'Plus Jakarta Sans'; font-weight: 700; color: #fff;">${p.judul}</h4>
                                        <p style="font-size: 0.85rem; opacity: 0.8; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.8rem;">${p.isi}</p>
                                        <div style="font-size: 0.75rem; opacity: 0.6; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
                                            <i class="fas fa-clock"></i> ${p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "-"}
                                        </div>
                                    </div>
                                  `;
                                        })
                                        .join("")
                                    : `<div style="color:rgba(255,255,255,0.5); font-style:italic;">Tidak ada pengumuman.</div>`
                                }
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 4rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; opacity: 0.6;">
                        <p style="color: white; font-size: 0.8rem; font-weight: 800; letter-spacing: 3px; margin: 0;">KEMENTERIAN KESEHATAN REPUBLIK INDONESIA</p>
                    </div>
                </div>
            </div>
        </div>
        <div style="position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 100; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); padding: 0.75rem 2rem; border-radius: 50px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 0.75rem; white-space: nowrap;">
            <span style="color: var(--txt-muted); font-size: 0.85rem; font-weight: 600;">&copy; ${new Date().getFullYear()} Copyright by</span>
            <a href="https://Masandigital.com" target="_blank" style="color: var(--accent); font-weight: 800; text-decoration: none; font-size: 0.85rem;">Masandigital.com</a>
        </div>

        <style>
            .auth-container { padding: 0 !important; max-width: 100% !important; background: none !important; display: block !important; }
            .login-side .card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .login-side .card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
            .schedule-side .card:hover { transform: translateY(-3px); background: rgba(255,255,255,1) !important; color: var(--text-primary) !important; }
            .schedule-side .card:hover h4, .schedule-side .card:hover p { color: var(--text-primary) !important; opacity: 1 !important; }
            input:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 4px var(--primary-glow) !important; }
            
            @media (max-width: 1100px) {
                .schedule-side > div > div:nth-child(2) { grid-template-columns: 1fr !important; }
            }
            @media (max-width: 992px) {
                .auth-wrapper { flex-direction: column; }
                .schedule-side { padding: 4rem 1.5rem; order: 1; min-height: 500px; overflow-y: visible; }
                .login-side { padding: 4rem 1.5rem; order: 2; }
            }
        </style>
    `;

  document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    const submitBtn = e.target.querySelector("button");
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Memverifikasi...';
    submitBtn.disabled = true;

    const ok = await Auth.login(user, pass);
    if (ok) {
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Berhasil!';
      submitBtn.style.background = "var(--success)";
      setTimeout(() => {
        window.location.hash = "#/dashboard";
      }, 800);
    } else {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      alert("Login Gagal! Username atau password salah.");
    }
  };
};

// --- DASHBOARD ---
window.render_dashboard = async () => {
  const content = document.getElementById("page-content");

  // Show skeleton loader
  content.innerHTML = `
        <div class="grid-cols-4" style="margin-bottom: 2rem;">
            ${[1, 2, 3, 4]
              .map(
                () => `
                <div class="stat-card">
                    <div style="width: 40px; height: 10px; background: #f1f5f9; border-radius: 4px; margin-bottom: 1rem;"></div>
                    <div style="width: 80px; height: 24px; background: #f8fafc; border-radius: 6px;"></div>
                </div>
            `,
              )
              .join("")}
        </div>
        <div class="grid-stack grid-cols-2">
            <div class="card"><div class="skeleton" style="height:300px; border-radius:12px;"></div></div>
            <div class="card"><div class="skeleton" style="height:300px; border-radius:12px;"></div></div>
        </div>
    `;

  const user = Auth.getUser();
  const isKader = user.role === "kader";
  const posyanduFilter = isKader ? user.posyandu : null;
  const cacheSuffix = isKader ? `_${user.posyandu}` : "";

  const fetchDashboardData = async () => {
    return await Promise.all([
      cacheManager.get(`dashboard_anak${cacheSuffix}`, () => {
        let sql =
          "SELECT status_aktif, jenis_kelamin, tgl_lahir, posyandu FROM anak";
        return isKader
          ? db.query(sql + " WHERE posyandu = ?", [posyanduFilter])
          : db.query(sql);
      }),
      cacheManager.get(`dashboard_users${cacheSuffix}`, () => {
        let sql = "SELECT role, posyandu FROM users";
        return isKader
          ? db.query(sql + " WHERE posyandu = ?", [posyanduFilter])
          : db.query(sql);
      }),
      cacheManager.get(`dashboard_alerts${cacheSuffix}`, () => {
        let sql = "SELECT is_read, posyandu FROM alerts";
        return isKader
          ? db.query(sql + " WHERE posyandu = ?", [posyanduFilter])
          : db.query(sql);
      }),
      cacheManager.get(`dashboard_weighings${cacheSuffix}`, () => {
        let sql =
          "SELECT weight, status_gizi, tgl_ukur, anak_id, posyandu FROM penimbangan";
        return isKader
          ? db.query(sql + " WHERE posyandu = ? ORDER BY tgl_ukur DESC", [
              posyanduFilter,
            ])
          : db.query(sql + " ORDER BY tgl_ukur DESC");
      }),
      cacheManager.get(`dashboard_jadwal${cacheSuffix}`, () => {
        let sql = "SELECT * FROM jadwal_posyandu WHERE tgl_kegiatan >= ?";
        let params = [new Date().toLocaleDateString("en-CA")];
        if (isKader) {
          sql += " AND posyandu = ? ORDER BY tgl_kegiatan ASC LIMIT 5";
          params.push(posyanduFilter);
        } else {
          sql += " ORDER BY tgl_kegiatan ASC LIMIT 5";
        }
        return db.query(sql, params);
      }),
      cacheManager.get(`dashboard_posyandu${cacheSuffix}`, () => {
        return db.query("SELECT * FROM wilayah_posyandu");
      }),
    ]);
  };

  const [resAnak, resUsers, resAlerts, resWeighings, resJadwal, resPosyandu] =
    await fetchDashboardData();

  const totalAnak = resAnak
    ? resAnak.filter((a) => a.status_aktif == 1).length
    : 0;
  const totalKader = resUsers
    ? resUsers.filter((u) => u.role === "kader").length
    : 0;
  const totalAlerts = resAlerts
    ? resAlerts.filter((a) => a.is_read == 0).length
    : 0;
  const allWeighings = resWeighings || [];

  // Calculate Stats
  const giziStats = { Baik: 0, Kurang: 0, Buruk: 0, Lebih: 0 };
  const genderStats = { L: 0, P: 0 };
  const ageStats = {
    "0-11 bln": 0,
    "12-23 bln": 0,
    "24-35 bln": 0,
    "36-47 bln": 0,
    "48+ bln": 0,
  };

  const childFinalStatus = {};
  allWeighings.forEach((w) => {
    if (!childFinalStatus[w.anak_id])
      childFinalStatus[w.anak_id] = w.status_gizi;
  });

  Object.values(childFinalStatus).forEach((s) => {
    const status = s ? s.charAt(0).toUpperCase() + s.slice(1) : "Baik";
    if (giziStats[status] !== undefined) giziStats[status]++;
    else giziStats["Baik"]++;
  });

  if (resAnak) {
    resAnak.forEach((a) => {
      if (genderStats[a.jenis_kelamin] !== undefined)
        genderStats[a.jenis_kelamin]++;

      // Calculate age
      const birth = new Date(a.tgl_lahir);
      const today = new Date();
      const months =
        (today.getFullYear() - birth.getFullYear()) * 12 +
        (today.getMonth() - birth.getMonth());

      if (months < 12) ageStats["0-11 bln"]++;
      else if (months < 24) ageStats["12-23 bln"]++;
      else if (months < 36) ageStats["24-35 bln"]++;
      else if (months < 48) ageStats["36-47 bln"]++;
      else ageStats["48+ bln"]++;
    });
  }

  const totalWilayah = resPosyandu ? resPosyandu.length : 0;

  content.innerHTML = `
        <div class="fade-in">
            <div class="grid-cols-4" style="margin-bottom: 2rem;">
                <div class="stat-card" style="border-left: 5px solid var(--accent);">
                    <div class="stat-icon-bg"><i class="fas fa-baby"></i></div>
                    <div class="stat-label">Total Balita</div>
                    <div class="stat-value">${totalAnak}</div>
                    <div class="stat-desc">Anak Terdaftar Aktif</div>
                </div>
                <div class="stat-card" style="border-left: 5px solid var(--warning);">
                    <div class="stat-icon-bg" style="background:var(--warning-light); color:var(--warning);"><i class="fas fa-user-nurse"></i></div>
                    <div class="stat-label">Total Kader</div>
                    <div class="stat-value">${totalKader}</div>
                    <div class="stat-desc">Petugas Lapangan</div>
                </div>
                <div class="stat-card" style="border-left: 5px solid var(--danger);">
                    <div class="stat-icon-bg" style="background:var(--danger-light); color:var(--danger);"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="stat-label">Notifikasi</div>
                    <div class="stat-value">${totalAlerts}</div>
                    <div class="stat-desc">Perlu Perhatian Segera</div>
                </div>
                <div class="stat-card" style="border-left: 5px solid var(--success);">
                    <div class="stat-icon-bg" style="background:var(--success-light); color:var(--success);"><i class="fas fa-vial-circle-check"></i></div>
                    <div class="stat-label">Penimbangan</div>
                    <div class="stat-value">${allWeighings.length}</div>
                    <div class="stat-desc">Total Rekam Medis</div>
                </div>
                ${
                  user.role == "admin"
                    ? `
                <div class="stat-card" style="border-left: 5px solid var(--secondary);">
                    <div class="stat-icon-bg" style="background:rgba(124, 58, 237, 0.1); color:var(--secondary);"><i class="fas fa-map-location-dot"></i></div>
                    <div class="stat-label">Total Wilayah</div>
                    <div class="stat-value">${totalWilayah}</div>
                    <div class="stat-desc">Posyandu Terdaftar</div>
                </div>
                `
                    : ""
                }
            </div>

            <div class="grid-stack grid-cols-2">
                <div class="card shadow-premium">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-chart-line"></i> Status Gizi Balita</h3>
                    </div>
                    <div style="height: 300px; width: 100%;"><canvas id="giziChart"></canvas></div>
                </div>

                <div class="card shadow-premium">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-calendar-alt"></i> Jadwal Mendatang</h3>
                        <a href="#/jadwal" class="btn btn-outline btn-sm">Lihat Semua</a>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${
                          resJadwal && resJadwal.length
                            ? resJadwal
                                .map(
                                  (j) => `
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='none'">
                                <div style="width: 50px; height: 50px; background: var(--primary); color: white; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.8rem;">
                                    <span style="font-weight: 800; font-size: 1.1rem; line-height: 1;">${new Date(j.tgl_kegiatan).getDate()}</span>
                                    <span style="font-weight: 600; text-transform: uppercase; font-size: 0.6rem;">${new Date(j.tgl_kegiatan).toLocaleDateString("id-ID", { month: "short" })}</span>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 0.7rem; color: var(--txt-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 0.2rem;">
                                        ${j.author || "Admin"} &bull; ${j.posyandu || "Global"}
                                    </div>
                                    <div style="font-weight: 700; color: var(--primary);">${j.nama_kegiatan}</div>
                                    <div style="font-size: 0.8rem; color: var(--txt-muted);"><i class="fas fa-map-marker-alt"></i> ${j.tempat}</div>
                                </div>
                            </div>
                        `,
                                )
                                .join("")
                            : '<div style="text-align:center; padding: 2rem; color: var(--txt-muted);">Tidak ada jadwal mendatang.</div>'
                        }
                    </div>
                </div>
            </div>

            <div class="grid-stack grid-cols-2">
                <div class="card shadow-premium">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-chart-pie"></i> Komposisi Gender</h3>
                    </div>
                    <div style="height: 250px; width: 100%;"><canvas id="genderChart"></canvas></div>
                </div>

                <div class="card shadow-premium">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-chart-bar"></i> Distribusi Usia</h3>
                    </div>
                    <div style="height: 250px; width: 100%;"><canvas id="ageChart"></canvas></div>
                </div>
            </div>

            <div class="card shadow-premium" style="margin-top: 2rem;">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-rocket"></i> Akses Cepat Layanan</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                    <a href="#/anak_form" class="btn btn-outline" style="height: auto; padding: 2rem; flex-direction: column; gap: 1rem; border-color: #e2e8f0; border-radius: 20px;">
                        <div style="width: 60px; height: 60px; background: var(--accent-light); color: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <span style="font-weight: 800;">Daftar Balita Baru</span>
                    </a>
                    <a href="#/anak_list" class="btn btn-outline" style="height: auto; padding: 2rem; flex-direction: column; gap: 1rem; border-color: #e2e8f0; border-radius: 20px;">
                        <div style="width: 60px; height: 60px; background: var(--success-light); color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                            <i class="fas fa-weight"></i>
                        </div>
                        <span style="font-weight: 800;">Entri Penimbangan</span>
                    </a>
                    <a href="#/jadwal_form" class="btn btn-outline" style="height: auto; padding: 2rem; flex-direction: column; gap: 1rem; border-color: #e2e8f0; border-radius: 20px;">
                        <div style="width: 60px; height: 60px; background: var(--warning-light); color: var(--warning); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                            <i class="fas fa-calendar-plus"></i>
                        </div>
                        <span style="font-weight: 800;">Buat Jadwal Posyandu</span>
                    </a>
                    <a href="#/pengumuman_form" class="btn btn-outline" style="height: auto; padding: 2rem; flex-direction: column; gap: 1rem; border-color: #e2e8f0; border-radius: 20px;">
                        <div style="width: 60px; height: 60px; background: var(--danger-light); color: var(--danger); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                            <i class="fas fa-bullhorn"></i>
                        </div>
                        <span style="font-weight: 800;">Kirim Pengumuman</span>
                    </a>
                </div>
            </div>
        </div>
    `;

  // Render Charts
  const ctx = document.getElementById("giziChart");
  if (ctx) {
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(giziStats),
        datasets: [
          {
            data: Object.values(giziStats),
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"],
            borderWidth: 0,
            hoverOffset: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { weight: "800", family: "Inter", size: 12 },
            },
          },
        },
      },
    });
  }

  // Gender Chart
  const ctxGender = document.getElementById("genderChart");
  if (ctxGender) {
    new Chart(ctxGender, {
      type: "doughnut",
      data: {
        labels: ["Laki-laki", "Perempuan"],
        datasets: [
          {
            data: [genderStats["L"], genderStats["P"]],
            backgroundColor: ["#3b82f6", "#ec4899"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { weight: "700", family: "Inter" },
            },
          },
        },
      },
    });
  }

  // Age Chart
  const ctxAge = document.getElementById("ageChart");
  if (ctxAge) {
    new Chart(ctxAge, {
      type: "bar",
      data: {
        labels: Object.keys(ageStats),
        datasets: [
          {
            label: "Jumlah Balita",
            data: Object.values(ageStats),
            backgroundColor: "rgba(139, 92, 246, 0.8)",
            borderRadius: 8,
            barThickness: 25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { display: false },
          },
          x: { grid: { display: false } },
        },
      },
    });
  }
};

// --- ANAK LIST ---
window.render_anak_list = async () => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat daftar anak...</div>';

  // Helper function to calculate age in months
  const calculateAgeInMonths = (birthDate) => {
    if (!birthDate) return 0;
    try {
      const birth = new Date(birthDate);
      const today = new Date();

      if (isNaN(birth.getTime())) return 0;

      let months = (today.getFullYear() - birth.getFullYear()) * 12;
      months += today.getMonth() - birth.getMonth();

      // Adjust if birthday hasn't occurred this month
      if (today.getDate() < birth.getDate()) {
        months--;
      }

      return Math.max(0, months); // Ensure non-negative
    } catch (e) {
      return 0;
    }
  };

  // Fetch with caching for SUPER FAST loads
  const user = Auth.getUser();
  const isKader = user.role === "kader";
  const cacheKey = isKader ? `anak_list_${user.posyandu}` : "anak_list";

  const anakList = await cacheManager.get(
    cacheKey,
    () => {
      let sql = "SELECT * FROM anak WHERE status_aktif = 1";
      if (isKader) {
        return db.query(sql + " AND posyandu = ? ORDER BY created_at DESC", [
          user.posyandu,
        ]);
      }
      return db.query(sql + " ORDER BY created_at DESC");
    },
    3 * 60 * 1000,
  );

  // Calculate age for each child
  anakList.forEach((anak) => {
    anak.usia_bulan = calculateAgeInMonths(anak.tgl_lahir);
  });

  // ========== PAGINATION & SEARCH FOR 5000+ RECORDS ==========
  let currentPage = 1;
  const itemsPerPage = 20; // Show 20 items per page
  let filteredData = [...anakList];

  const renderTable = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    content.innerHTML = `
        <div class="card fade-in">
            <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h3 class="card-title"><i class="fas fa-users-medical"></i> Database Balita</h3>
                    <p style="font-size: 0.8rem; color: var(--txt-muted); margin-top: 5px;">
                        Showing ${filteredData.length} records ${filteredData.length !== anakList.length ? "(Filtered)" : ""}
                    </p>
                </div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <a href="#/anak_form" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Tambah Data Anak
                    </a>
                </div>
            </div>

            <!-- SEARCH & FILTERS -->
            <div style="display: flex; gap: 1rem; margin-bottom: 2rem; padding: 0 1.5rem; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; min-width: 250px;">
                    <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--txt-muted);"></i>
                    <input type="text" id="anakSearch" placeholder="Cari nama balita atau NIK..." style="padding-left: 2.75rem; height: 44px; border-radius: 10px; width:100%" value="${window.lastSearchQuery || ""}">
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <select id="genderFilter" style="width: 150px; height: 44px; border-radius: 10px;">
                        <option value="">Semua Gender</option>
                        <option value="L" ${window.lastGenderFilter === "L" ? "selected" : ""}>Laki-laki</option>
                        <option value="P" ${window.lastGenderFilter === "P" ? "selected" : ""}>Perempuan</option>
                    </select>
                </div>
            </div>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>Anak & Identitas</th>
                            <th>Info Kelahiran</th>
                            <th>Orang Tua</th>
                            <th style="text-align: right; padding-right: 1.5rem;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          pageData.length
                            ? pageData
                                .map(
                                  (a, idx) => `
                            <tr>
                                <td style="font-weight:700; color:var(--txt-muted);">${startIndex + idx + 1}</td>
                                <td>
                                    <div style="font-weight: 800; color:var(--primary); font-size: 1rem;">${a.nama}</div>
                                    <div style="font-size: 0.75rem; color: var(--txt-soft); font-weight: 600;">NIK: ${a.nik || "-"}</div>
                                </td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: ${a.jenis_kelamin == "L" ? "#eff6ff" : "#fdf2f8"}; color: ${a.jenis_kelamin == "L" ? "#3b82f6" : "#ec4899"};">
                                            <i class="fas fa-${a.jenis_kelamin == "L" ? "mars" : "venus"}"></i>
                                        </div>
                                        <div>
                                            <div style="font-weight: 700; color: var(--txt-main);">${a.usia_bulan} bln</div>
                                            <div style="font-size: 0.7rem; color: var(--txt-muted);">${a.tgl_lahir}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style="font-weight: 600; color: var(--txt-main);">${a.nama_ibu}</div>
                                    <div style="font-size: 0.75rem; color: var(--txt-muted);">Ibu Kandung</div>
                                </td>
                                <td style="text-align: right; padding-right: 1.5rem;">
                                    <div style="display:flex; gap:6px; justify-content: flex-end;">
                                        <a href="#/anak_detail?id=${a.id}" class="btn btn-outline btn-sm" style="width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; border-radius: 8px;" title="Detail KMS">
                                            <i class="fas fa-chart-line"></i>
                                        </a>
                                        <a href="#/anak_form?id=${a.id}" class="btn btn-outline btn-sm" style="width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; border-radius: 8px;" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        ${
                                          Auth.getUser().role === "admin"
                                            ? `
                                        <button onclick="window.deleteAnak('${a.id}', '${a.nama.replace(/'/g, "\\'")}')" class="btn btn-outline btn-sm" style="width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; border-radius: 8px; color:var(--danger)" title="Hapus">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                        `
                                            : ""
                                        }
                                    </div>
                                </td>
                            </tr>
                        `,
                                )
                                .join("")
                            : `<tr><td colspan="5" style="text-align:center; padding:5rem 2rem;">
                                <div style="margin-bottom: 1.5rem; opacity: 0.2;"><i class="fas fa-users-slash" style="font-size: 4rem;"></i></div>
                                <h4 style="color: var(--txt-soft);">Data Tidak Ditemukan</h4>
                                <p style="color: var(--txt-muted); font-size: 0.9rem;">Belum ada data balita atau filter tidak cocok.</p>
                            </td></tr>`
                        }
                    </tbody>
                </table>
            </div>
            
            <!-- PAGINATION -->
            ${
              totalPages > 1
                ? `
            <div style="padding:1.5rem; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background: #fafafa; border-radius: 0 0 16px 16px;">
                <div style="color:var(--txt-muted); font-size:0.85rem; font-weight: 500;">
                    Hal <span style="font-weight: 700; color: var(--primary)">${currentPage}</span> dari ${totalPages} • Total ${filteredData.length} Data
                </div>
                <div style="display:flex; gap:0.4rem;">
                    <button onclick="changePage(${currentPage - 1})" class="btn btn-outline btn-sm" ${currentPage === 1 ? "disabled" : ""} style="border-radius: 8px;">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    ${Array.from(
                      { length: Math.min(5, totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2)
                          pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return `
                            <button onclick="changePage(${pageNum})" class="btn btn-sm ${currentPage === pageNum ? "btn-primary" : "btn-outline"}" style="min-width:36px; height:36px; border-radius: 8px; font-weight: 700;">
                                ${pageNum}
                            </button>
                        `;
                      },
                    ).join("")}
                    <button onclick="changePage(${currentPage + 1})" class="btn btn-outline btn-sm" ${currentPage === totalPages ? "disabled" : ""} style="border-radius: 8px;">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            `
                : ""
            }
        </div>
    `;

    // Add search event listener
    const searchInput = document.getElementById("anakSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        window.lastSearchQuery = e.target.value;
        const query = e.target.value.toLowerCase().trim();
        filterAndRender(query, window.lastGenderFilter || "");
      });
    }

    // Add filter event listener
    const genderFilter = document.getElementById("genderFilter");
    if (genderFilter) {
      genderFilter.addEventListener("change", (e) => {
        window.lastGenderFilter = e.target.value;
        filterAndRender(window.lastSearchQuery || "", e.target.value);
      });
    }

    function filterAndRender(query, gender) {
      filteredData = anakList.filter((a) => {
        const matchQuery =
          !query ||
          a.nama?.toLowerCase().includes(query) ||
          a.nik?.toLowerCase().includes(query) ||
          a.nama_ibu?.toLowerCase().includes(query);
        const matchGender = !gender || a.jenis_kelamin === gender;
        return matchQuery && matchGender;
      });
      currentPage = 1;
      renderTable();
    }
  };

  // Global functions for pagination
  window.changePage = (page) => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      renderTable();
      // Scroll to top of table
      document
        .querySelector(".table-responsive")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  window.clearSearch = () => {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = "";
      filteredData = [...anakList];
      currentPage = 1;
      renderTable();
    }
  };

  // Initial render
  renderTable();
};

window.deleteAnak = async (id, name) => {
  if (
    confirm(
      `Hapus data anak "${name}"?\n\nSemua data penimbangan dan imunisasi anak ini juga akan dinonaktifkan.`,
    )
  ) {
    try {
      // Logical Delete (set status_aktif = 0)
      await db.execute("UPDATE anak SET status_aktif = 0 WHERE id = ?", [id]);
      db.log("DELETE_ANAK", `Menghapus data anak: ${name} (ID: ${id})`);

      // Clear caches
      if (window.cacheManager) {
        const userPosyandu = Auth.getUser().posyandu;
        cacheManager.invalidate(`dashboard_anak_${userPosyandu}`);
        cacheManager.invalidate(`anak_list_${userPosyandu}`);
        cacheManager.invalidate("dashboard_anak");
        cacheManager.invalidate("anak_list");
      }

      alert("Data anak berhasil dihapus!");
      window.render_anak_list();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data: " + err.message);
    }
  }
};

// --- ANAK FORM (TAMBAH / EDIT) ---
window.render_anak_form = async (id) => {
  const user = Auth.getUser();
  const content = document.getElementById("page-content");
  content.innerHTML = `
        <div class="card" style="text-align:center; padding:3rem;">
            <div class="loading-spinner" style="margin:0 auto 1rem;">
                <i class="fas fa-spinner fa-spin" style="font-size:3rem; color:var(--primary);"></i>
            </div>
            <p style="color:var(--text-muted); font-size:1.1rem;">Menyiapkan formulir...</p>
        </div>
    `;

  let posyandus = [];
  try {
    posyandus = await db.query(
      "SELECT nama_posyandu FROM wilayah_posyandu ORDER BY nama_posyandu ASC",
    );
  } catch (e) {}
  const params = { posyandus };

  // Helper function to format date to yyyy-MM-dd
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  let data = {
    nama: "",
    nik: "",
    tgl_lahir: "",
    jenis_kelamin: "L",
    nama_ibu: "",
    alamat: "",
    berat_lahir: "",
    posyandu: "",
  };
  let imunisasi = [];
  if (id) {
    data = await db.fetch("SELECT * FROM anak WHERE id = ?", [id]);

    // Safety check for multi-tenancy
    const userRole = Auth.getUser().role;
    const userPosyandu = Auth.getUser().posyandu;
    if (userRole === "kader" && data && data.posyandu !== userPosyandu) {
      return (content.innerHTML = `
          <div class="alert alert-danger" style="margin-top:2rem; padding:3rem; text-align:center;">
              <i class="fas fa-lock" style="font-size:3rem; margin-bottom:1rem; display:block;"></i>
              <h3>Akses Ditolak</h3>
              <p>Anda tidak memiliki izin untuk mengubah data anak dari wilayah lain.</p>
              <button onclick="history.back()" class="btn btn-primary" style="margin-top:1rem;">Kembali</button>
          </div>
       `);
    }

    // Format date for HTML input
    if (data && data.tgl_lahir) {
      data.tgl_lahir = formatDate(data.tgl_lahir);
    }
    try {
      imunisasi = await db.query(
        "SELECT * FROM imunisasi WHERE anak_id = ? ORDER BY tgl_diberikan DESC",
        [id],
      );
    } catch (e) {
      /* ignore if table missing */
    }
  }

  content.innerHTML = `
        <style>
            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            .form-section {
                animation: slideInUp 0.5s ease-out;
                background: linear-gradient(135deg, rgba(0,155,119,0.03) 0%, rgba(6,182,212,0.03) 100%);
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 2rem;
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }
            .form-section:hover {
                border-color: var(--primary);
                box-shadow: 0 8px 30px rgba(0,155,119,0.15);
                transform: translateY(-2px);
            }
            .section-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid var(--border);
            }
            .section-icon {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: white;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .icon-child { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); }
            .icon-mother { background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%); }
            .icon-location { background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); }
            .icon-health { background: linear-gradient(135deg, #10B981 0%, #34D399 100%); }
            .section-title {
                font-family: 'Outfit', sans-serif;
                font-size: 1.4rem;
                font-weight: 700;
                color: var(--text-main);
                margin: 0;
            }
            .enhanced-input-group {
                position: relative;
                margin-bottom: 1.5rem;
            }
            .enhanced-input-group .input-icon {
                position: absolute;
                left: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: var(--primary);
                font-size: 1.1rem;
                z-index: 1;
                transition: all 0.3s;
            }
            .enhanced-input-group input,
            .enhanced-input-group select,
            .enhanced-input-group textarea {
                padding-left: 3rem;
                transition: all 0.3s ease;
            }
            .enhanced-input-group:focus-within .input-icon {
                color: var(--secondary);
                transform: translateY(-50%) scale(1.2);
            }
            .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                font-weight: 700;
                font-size: 1rem;
                margin-bottom: 2rem;
                animation: fadeIn 0.5s ease-out;
            }
            .status-badge.edit-mode {
                background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(59,130,246,0.3);
            }
            .status-badge.new-mode {
                background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(16,185,129,0.3);
            }
            .submit-button {
                position: relative;
                overflow: hidden;
            }
            .submit-button::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255,255,255,0.3);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
            }
            .submit-button:hover::before {
                width: 300px;
                height: 300px;
            }
            .imunisasi-card {
                animation: slideInUp 0.6s ease-out;
                animation-delay: 0.2s;
                opacity: 0;
                animation-fill-mode: forwards;
            }
        </style>

        <div class="card form-card" style="animation: slideInUp 0.5s ease-out;">
            <div class="card-header" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; border-radius: 12px 12px 0 0; margin: -2.5rem -2.5rem 2rem -2.5rem; padding: 2rem 2.5rem;">
                <h3 class="card-title" style="color: white; font-size: 1.6rem; margin: 0;">
                    ${id ? '<i class="fas fa-edit"></i> Edit Data Anak' : '<i class="fas fa-plus-circle"></i> Tambah Data Anak Baru'}
                </h3>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9; font-size: 0.95rem;">
                    ${id ? "Perbarui informasi data anak dengan lengkap dan akurat" : "Lengkapi formulir di bawah untuk menambahkan data anak baru"}
                </p>
            </div>
            
            <div style="padding: 0;">
                <form id="anakForm">
                    <input type="hidden" id="form_mode_id" value="${id || ""}">
                    
                    <div class="status-badge ${id ? "edit-mode" : "new-mode"}">
                        <i class="fas ${id ? "fa-pen-to-square" : "fa-sparkles"}"></i>
                        <span>${id ? "MODE EDIT - ID: " + id : "MODE TAMBAH DATA BARU"}</span>
                    </div>

                    <!-- DATA ANAK SECTION -->
                    <div class="form-section">
                        <div class="section-header">
                            <div class="section-icon icon-child">
                                <i class="fas fa-baby"></i>
                            </div>
                            <h4 class="section-title">Data Anak</h4>
                        </div>
                        <div class="grid-stack grid-cols-2">
                            <div class="enhanced-input-group">
                                <i class="fas fa-user input-icon"></i>
                                <label>Nama Lengkap Anak</label>
                                <input type="text" id="fnama" value="${data.nama}" required placeholder="Masukkan nama lengkap">
                            </div>
                            <div class="enhanced-input-group">
                                <i class="fas fa-id-card input-icon"></i>
                                <label>NIK Anak</label>
                                <input type="text" id="fnik" value="${data.nik}" required maxlength="16" placeholder="16 digit NIK" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                            </div>
                            
                            <div class="enhanced-input-group">
                                <i class="fas fa-calendar-alt input-icon"></i>
                                <label>Tanggal Lahir</label>
                                <input type="date" id="ftgl" value="${data.tgl_lahir}" required>
                            </div>
                            <div class="enhanced-input-group">
                                <i class="fas fa-venus-mars input-icon"></i>
                                <label>Jenis Kelamin</label>
                                <select id="fjk">
                                    <option value="L" ${data.jenis_kelamin == "L" ? "selected" : ""}>👦 Laki-laki</option>
                                    <option value="P" ${data.jenis_kelamin == "P" ? "selected" : ""}>👧 Perempuan</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- DATA KELAHIRAN SECTION -->
                    <div class="form-section">
                        <div class="section-header">
                            <div class="section-icon icon-health">
                                <i class="fas fa-heartbeat"></i>
                            </div>
                            <h4 class="section-title">Data Kelahiran & Kesehatan</h4>
                        </div>
                        <div class="grid-stack grid-cols-2">
                            <div class="enhanced-input-group">
                                <i class="fas fa-weight input-icon"></i>
                                <label>Berat Lahir (kg)</label>
                                <input type="number" step="0.1" id="fberat" value="${data.berat_lahir}" placeholder="Contoh: 3.2">
                            </div>
                            <div class="enhanced-input-group">
                                <i class="fas fa-ruler-vertical input-icon"></i>
                                <label>Panjang Lahir (cm)</label>
                                <input type="number" step="0.1" id="fpanjang" value="${data.panjang_lahir || ""}" placeholder="Contoh: 48">
                            </div>

                            <div class="enhanced-input-group">
                                <i class="fas fa-sort-numeric-up input-icon"></i>
                                <label>Anak Ke-</label>
                                <input type="number" id="fanak_ke" value="${data.anak_ke || ""}" placeholder="Urutan kelahiran">
                            </div>
                            <div class="enhanced-input-group">
                                <i class="fas fa-hospital-user input-icon"></i>
                                <label>Status BPJS</label>
                                <select id="fbpjs">
                                    <option value="Umum" ${data.status_bpjs == "Umum" ? "selected" : ""}>💳 Umum / Mandiri</option>
                                    <option value="BPJS" ${data.status_bpjs == "BPJS" ? "selected" : ""}>🏥 BPJS / KIS</option>
                                    <option value="Lainnya" ${data.status_bpjs == "Lainnya" ? "selected" : ""}>📋 Asuransi Lain</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- DATA IBU SECTION -->
                    <div class="form-section">
                        <div class="section-header">
                            <div class="section-icon icon-mother">
                                <i class="fas fa-female"></i>
                            </div>
                            <h4 class="section-title">Data Ibu Kandung</h4>
                        </div>
                        <div class="grid-stack grid-cols-2">
                            <div class="enhanced-input-group">
                                <i class="fas fa-user-nurse input-icon"></i>
                                <label>Nama Ibu</label>
                                <input type="text" id="fibu" value="${data.nama_ibu}" required placeholder="Nama lengkap ibu">
                            </div>
                            <div class="enhanced-input-group">
                                <i class="fas fa-id-card-alt input-icon"></i>
                                <label>NIK Ibu</label>
                                <input type="text" id="fnik_ibu" value="${data.nik_ibu || ""}" maxlength="16" placeholder="16 digit NIK ibu">
                            </div>
                            
                            <div class="enhanced-input-group">
                                <i class="fas fa-birthday-cake input-icon"></i>
                                <label>Usia Ibu (Tahun)</label>
                                <input type="number" id="fusia_ibu" value="${data.usia_ibu || ""}" placeholder="Usia dalam tahun">
                            </div>
                            <div class="enhanced-input-group">
                                <i class="fas fa-graduation-cap input-icon"></i>
                                <label>Pendidikan Terakhir</label>
                                <select id="fpendidikan_ibu">
                                    <option value="">- Pilih Pendidikan -</option>
                                    <option value="SD" ${data.pendidikan_ibu == "SD" ? "selected" : ""}>📚 SD</option>
                                    <option value="SMP" ${data.pendidikan_ibu == "SMP" ? "selected" : ""}>📖 SMP</option>
                                    <option value="SMA" ${data.pendidikan_ibu == "SMA" ? "selected" : ""}>📘 SMA / SMK</option>
                                    <option value="D3" ${data.pendidikan_ibu == "D3" ? "selected" : ""}>🎓 D3</option>
                                    <option value="S1" ${data.pendidikan_ibu == "S1" ? "selected" : ""}>🎓 S1 / S2</option>
                                    <option value="Tidak Sekolah" ${data.pendidikan_ibu == "Tidak Sekolah" ? "selected" : ""}>❌ Tidak Sekolah</option>
                                </select>
                            </div>

                            <div class="enhanced-input-group">
                                <i class="fas fa-briefcase input-icon"></i>
                                <label>Pekerjaan</label>
                                <input type="text" id="fpekerjaan_ibu" value="${data.pekerjaan_ibu || ""}" placeholder="Contoh: Ibu Rumah Tangga">
                            </div>
                            <div class="enhanced-input-group">
                                <i class="fas fa-apple-alt input-icon"></i>
                                <label>Status Gizi Ibu</label>
                                <select id="fgizi_ibu">
                                    <option value="Normal" ${data.status_gizi_ibu == "Normal" ? "selected" : ""}>✅ Normal</option>
                                    <option value="KEK" ${data.status_gizi_ibu == "KEK" ? "selected" : ""}>⚠️ KEK (Kurang Energi Kronis)</option>
                                    <option value="Obesitas" ${data.status_gizi_ibu == "Obesitas" ? "selected" : ""}>🔴 Obesitas</option>
                                </select>
                            </div>
                            
                            <div class="enhanced-input-group" style="grid-column: span 2;">
                                <i class="fas fa-notes-medical input-icon"></i>
                                <label>Riwayat Kehamilan</label>
                                <input type="text" id="fhamil" value="${data.riwayat_kehamilan || ""}" placeholder="Contoh: Normal, Pendarahan, Komplikasi, dll">
                            </div>
                        </div>
                    </div>

                    <!-- ALAMAT SECTION -->
                    <div class="form-section">
                        <div class="section-header">
                            <div class="section-icon icon-location">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <h4 class="section-title">Alamat Tinggal</h4>
                        </div>
                        <div class="enhanced-input-group">
                            <i class="fas fa-home input-icon" style="top: 2rem;"></i>
                            <label>Alamat Lengkap</label>
                            <textarea id="falamat" placeholder="Masukkan alamat lengkap dengan RT/RW, Kelurahan, Kecamatan..." style="min-height: 120px;">${data.alamat}</textarea>
                        </div>
                        <div class="enhanced-input-group" id="posyandu_sec">
                            <i class="fas fa-clinic-medical input-icon"></i>
                            <label>Wilayah Posyandu</label>
                            ${
                              user.role === "kader"
                                ? `<input type="text" id="fposyandu" value="${id ? data.posyandu : user.posyandu}" readonly style="background:#f1f5f9; cursor:not-allowed;">
                                   <small style="color:var(--txt-muted);">Otomatis sesuai wilayah tugas Anda</small>`
                                : `
                                <select id="fposyandu">
                                    <option value="">- Pilih Wilayah -</option>
                                    ${(params.posyandus || []).map((p) => `<option value="${p.nama_posyandu}" ${data.posyandu == p.nama_posyandu ? "selected" : ""}>${p.nama_posyandu}</option>`).join("")}
                                </select>
                                `
                            }
                        </div>
                    </div>

                    <!-- ACTION BUTTONS -->
                    <div style="display: flex; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 2px dashed var(--border);">
                        <button type="button" onclick="history.back()" class="btn btn-outline" style="flex:1; font-size: 1.05rem; padding: 1rem;">
                            <i class="fas fa-times-circle"></i> Batal
                        </button>
                        <button type="submit" class="btn btn-primary submit-button" style="flex:2; font-size: 1.1rem; padding: 1rem; animation: pulse 2s infinite;">
                            <i class="fas fa-save"></i> ${id ? "💾 Simpan Perubahan" : "✨ Simpan Data Baru"}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        ${
          id
            ? `
        <!-- IMUNISASI SECTION (EDIT MODE ONLY) -->
        <div class="grid-stack grid-cols-2" style="margin-top:2rem;">
            <div class="card imunisasi-card">
                <div class="card-header" style="background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%); color: white; border-radius: 12px; padding: 1.5rem;">
                    <h3 class="card-title" style="color: white; margin: 0;">
                        <i class="fas fa-syringe"></i> Riwayat Imunisasi
                    </h3>
                </div>
                <div class="table-responsive" style="max-height: 300px; overflow-y:auto; margin-top: 1rem;">
                    <table>
                        <thead><tr><th>📅 Tanggal</th><th>💉 Jenis Vaksin</th><th>📝 Keterangan</th></tr></thead>
                        <tbody>
                            ${
                              imunisasi && imunisasi.length
                                ? imunisasi
                                    .map(
                                      (im) => `
                                <tr style="transition: all 0.3s;">
                                    <td>${im.tgl_diberikan}</td>
                                    <td><strong style="color: var(--primary);">${im.jenis_imunisasi}</strong></td>
                                    <td>${im.keterangan || "-"}</td>
                                </tr>
                            `,
                                    )
                                    .join("")
                                : '<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:2rem;"><i class="fas fa-info-circle" style="font-size:2rem; margin-bottom:0.5rem; display:block;"></i>Belum ada data imunisasi.</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="card form-card imunisasi-card">
                 <div class="card-header" style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%); color: white; border-radius: 12px; padding: 1.5rem;">
                    <h3 class="card-title" style="color: white; margin: 0;">
                        <i class="fas fa-plus-circle"></i> Catat Imunisasi Baru
                    </h3>
                </div>
                 <form id="imunFormEdit" style="margin-top: 1rem;">
                    <div class="enhanced-input-group">
                        <i class="fas fa-syringe input-icon"></i>
                        <label>Jenis Imunisasi</label>
                        <select id="im_jenis" required>
                             <option value="" disabled selected>Pilih Vaksin...</option>
                             <option value="Hepatitis B (0 Bulan)">💉 Hepatitis B (Hb0)</option>
                             <option value="BCG (1 Bulan)">💉 BCG</option>
                             <option value="Polio 1 (1 Bulan)">💉 Polio 1</option>
                             <option value="DPT-HB-Hib 1 (2 Bulan)">💉 DPT-HB-Hib 1</option>
                             <option value="Polio 2 (2 Bulan)">💉 Polio 2</option>
                             <option value="DPT-HB-Hib 2 (3 Bulan)">💉 DPT-HB-Hib 2</option>
                             <option value="Polio 3 (3 Bulan)">💉 Polio 3</option>
                             <option value="DPT-HB-Hib 3 (4 Bulan)">💉 DPT-HB-Hib 3</option>
                             <option value="Polio 4 (4 Bulan)">💉 Polio 4</option>
                             <option value="IPV (4 Bulan)">💉 IPV (Polio Suntik)</option>
                             <option value="Campak/MR (9 Bulan)">💉 Campak / MR</option>
                             <option value="DPT-HB-Hib Lanjutan (18 Bulan)">💉 DPT-HB-Hib Lanjutan</option>
                             <option value="Campak/MR Lanjutan (24 Bulan)">💉 Campak / MR Lanjutan</option>
                        </select>
                    </div>
                    <div class="enhanced-input-group">
                        <i class="fas fa-calendar-check input-icon"></i>
                        <label>Tanggal Diberikan</label>
                        <input type="date" id="im_tgl" required>
                    </div>
                    <div class="enhanced-input-group">
                        <i class="fas fa-comment-medical input-icon"></i>
                        <label>Keterangan</label>
                        <input type="text" id="im_ket" placeholder="Opsional (misal: Demam setelah suntik)">
                    </div>
                    <button type="submit" class="btn btn-primary submit-button" style="width:100%; margin-top:1rem; padding: 1rem;">
                        <i class="fas fa-check-circle"></i> Simpan Imunisasi
                    </button>
                 </form>
            </div>
        </div>
        `
            : ""
        }
    `;

  if (id) {
    // Handle Imunisasi Submit inside Edit Form
    try {
      setTimeout(() => {
        const form = document.getElementById("imunFormEdit");
        if (form) {
          document.getElementById("im_tgl").valueAsDate = new Date();
          form.onsubmit = async (e) => {
            e.preventDefault();
            const jenis = document.getElementById("im_jenis").value;
            const tgl = document.getElementById("im_tgl").value;
            const ket = document.getElementById("im_ket").value;

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML =
              '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
            submitBtn.disabled = true;

            try {
              await db.execute(
                "INSERT INTO imunisasi (anak_id, jenis_imunisasi, tgl_diberikan, keterangan) VALUES (?, ?, ?, ?)",
                [id, jenis, tgl, ket],
              );
              db.log(
                "ADD_IMUNISASI",
                `Imunisasi ${jenis} untuk anak ID: ${id}`,
              );

              // Show success message
              submitBtn.innerHTML =
                '<i class="fas fa-check-circle"></i> Berhasil!';
              submitBtn.style.background =
                "linear-gradient(135deg, #10B981 0%, #34D399 100%)";

              setTimeout(() => {
                window.render_anak_form(id);
              }, 1000);
            } catch (err) {
              submitBtn.innerHTML =
                '<i class="fas fa-times-circle"></i> Gagal!';
              submitBtn.disabled = false;
              alert("Gagal menyimpan: " + err.message);
            }
          };
        }
      }, 100);
    } catch (e) {}
  }

  document.getElementById("anakForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Menyimpan ke Database...';
    submitBtn.disabled = true;

    // ROBUST ID CHECK
    const currentId = document.getElementById("form_mode_id").value;
    const isEditMode =
      currentId && currentId.trim() !== "" && currentId !== "undefined";
    console.log("=== FORM SUBMIT DEBUG ===");
    console.log("Mode:", isEditMode ? "EDIT" : "NEW");
    console.log("ID:", currentId);

    // UNIQUE NIK CHECK
    const nik = document.getElementById("fnik").value;
    const checkDuplicate = await db.fetch(
      "SELECT id FROM anak WHERE nik = ? AND id != ?",
      [nik, isEditMode ? currentId : "NEW"],
    );
    if (checkDuplicate) {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      return alert(
        `Gagal: NIK ${nik} sudah terdaftar atas nama anak lain.\n\nHarap periksa kembali atau gunakan fitur Edit jika anak sudah ada.`,
      );
    }

    // COLLECT ALL VALUES
    const vals = [
      document.getElementById("fnama").value, // nama
      document.getElementById("fnik").value, // nik
      document.getElementById("ftgl").value, // tgl_lahir
      document.getElementById("fjk").value, // jenis_kelamin
      document.getElementById("fibu").value, // nama_ibu
      document.getElementById("fberat").value || "", // berat_lahir
      document.getElementById("falamat").value, // alamat
      1, // status_aktif

      // NEW FIELDS
      document.getElementById("fpanjang").value || "", // panjang_lahir
      document.getElementById("fanak_ke").value || "", // anak_ke
      document.getElementById("fbpjs").value, // status_bpjs
      document.getElementById("fnik_ibu").value || "", // nik_ibu
      document.getElementById("fusia_ibu").value || "", // usia_ibu
      document.getElementById("fpendidikan_ibu").value || "", // pendidikan_ibu
      document.getElementById("fpekerjaan_ibu").value || "", // pekerjaan_ibu
      document.getElementById("fgizi_ibu").value, // status_gizi_ibu
      document.getElementById("fhamil").value || "", // riwayat_kehamilan
      document.getElementById("fposyandu").value || "", // posyandu
      new Date().toISOString().slice(0, 19).replace("T", " "), // created_at (Explicit)
    ];

    console.log("Values to save:", vals);

    let res;
    try {
      if (isEditMode) {
        // UPDATE
        const updateVals = vals.slice(0, -1); // Remove created_at for update
        const q =
          "UPDATE anak SET nama=?, nik=?, tgl_lahir=?, jenis_kelamin=?, nama_ibu=?, berat_lahir=?, alamat=?, status_aktif=?, panjang_lahir=?, anak_ke=?, status_bpjs=?, nik_ibu=?, usia_ibu=?, pendidikan_ibu=?, pekerjaan_ibu=?, status_gizi_ibu=?, riwayat_kehamilan=?, posyandu=? WHERE id=?";

        console.log("UPDATE Query:", q);
        console.log("UPDATE Params:", [...updateVals, currentId]);

        res = await db.execute(q, [...updateVals, currentId]);
        console.log("UPDATE Response:", res);
      } else {
        // INSERT
        const q =
          "INSERT INTO anak (nama, nik, tgl_lahir, jenis_kelamin, nama_ibu, berat_lahir, alamat, status_aktif, panjang_lahir, anak_ke, status_bpjs, nik_ibu, usia_ibu, pendidikan_ibu, pekerjaan_ibu, status_gizi_ibu, riwayat_kehamilan, posyandu, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        console.log("INSERT Query:", q);
        console.log("INSERT Params:", vals);

        res = await db.execute(q, vals);
        console.log("INSERT Response:", res);
      }

      // Check response status
      console.log("Response Status:", res?.status);
      console.log("Full Response:", JSON.stringify(res, null, 2));

      if (!res) {
        throw new Error(
          "Tidak ada response dari server. Periksa koneksi internet Anda.",
        );
      }

      if (res.status === "error") {
        throw new Error(res.message || "Gagal menyimpan ke database.");
      }

      if (res.status !== "success") {
        throw new Error(
          "Response tidak valid dari server: " + JSON.stringify(res),
        );
      }

      // Check if UPDATE actually updated rows
      if (isEditMode) {
        const rowCount = res.rowCount || res.affectedRows || 0;
        console.log("Rows updated:", rowCount);

        if (rowCount === 0) {
          throw new Error(
            "Data tidak ditemukan atau tidak ada perubahan. Pastikan data dengan ID tersebut ada di database.",
          );
        }
      }

      // Success animation
      submitBtn.innerHTML =
        '<i class="fas fa-check-circle"></i> ✅ Data Berhasil Disimpan!';
      submitBtn.style.background =
        "linear-gradient(135deg, #10B981 0%, #34D399 100%)";

      // Clear relevant caches
      const userPosyandu = Auth.getUser().posyandu;
      cacheManager.invalidate(`dashboard_anak_${userPosyandu}`);
      cacheManager.invalidate(`anak_list_${userPosyandu}`);
      cacheManager.invalidate("dashboard_anak"); // Clear global too just in case
      cacheManager.invalidate("anak_list");

      // Log activity
      db.log(
        isEditMode ? "EDIT_ANAK" : "ADD_ANAK",
        `${isEditMode ? "Edit" : "Tambah"} data anak: ${vals[0]}`,
      );

      console.log("=== SAVE SUCCESS ===");
      console.log("Data saved successfully!");

      // Show success message
      alert(
        `✅ Data ${isEditMode ? "berhasil diperbarui" : "berhasil ditambahkan"}!\n\nNama: ${vals[0]}\nNIK: ${vals[1]}`,
      );

      await new Promise((r) => setTimeout(r, 1000));
      window.location.hash = "#/anak_list";
    } catch (err) {
      console.error("=== SAVE ERROR ===");
      console.error("Error Details:", err);
      console.error("Error Message:", err.message);
      console.error("Error Stack:", err.stack);

      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;

      // More detailed error message
      let errorMsg = "❌ Gagal Menyimpan Data!\n\n";
      errorMsg += "Error: " + err.message + "\n\n";
      errorMsg += "Kemungkinan penyebab:\n";
      errorMsg += "1. Koneksi internet terputus\n";
      errorMsg += "2. Google Apps Script tidak merespons\n";
      errorMsg += "3. Format data tidak sesuai\n\n";
      errorMsg += "Silakan coba lagi atau hubungi administrator.";

      alert(errorMsg);
    }
  };
};

// --- JADWAL POSYANDU ---
window.render_jadwal = async () => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat jadwal kegiatan...</div>';

  let jadwals = [];
  try {
    const user = Auth.getUser();
    const isKader = user.role === "kader";
    let sql = "SELECT * FROM jadwal_posyandu";
    let params = [];

    if (isKader) {
      sql += " WHERE posyandu = ?";
      params.push(user.posyandu);
    }

    sql += " ORDER BY tgl_kegiatan DESC";
    jadwals = await db.query(sql, params);
  } catch (e) {
    console.error("Error fetching jadwal:", e);
  }
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local

  content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <h3 class="card-title"><i class="fas fa-calendar-alt" style="color:var(--success)"></i> Jadwal Posyandu</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Agenda kegiatan posyandu mendatang.</p>
                </div>
                <a href="#/jadwal_form" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Tambah Jadwal</a>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th><i class="fas fa-calendar-day"></i> Tgl Kegiatan</th>
                            <th><i class="fas fa-tasks"></i> Nama Kegiatan</th>
                            <th><i class="fas fa-user-edit"></i> Petugas</th>
                            <th><i class="fas fa-map-marker-alt"></i> Tempat</th>
                            <th><i class="fas fa-info-circle"></i> Status</th>
                            <th><i class="fas fa-cog"></i> Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          jadwals.length
                            ? jadwals
                                .map((j) => {
                                  let statusBadge = "";
                                  // Assuming tgl_kegiatan stored as YYYY-MM-DD
                                  if (j.tgl_kegiatan < today) {
                                    statusBadge =
                                      '<span class="badge badge-success">Selesai</span>';
                                  } else if (j.tgl_kegiatan === today) {
                                    statusBadge =
                                      '<span class="badge badge-info">Hari Ini</span>';
                                  } else {
                                    statusBadge =
                                      '<span class="badge badge-warning">Akan Datang</span>';
                                  }

                                  return `
                            <tr>
                                <td style="font-weight:700;">
                                    ${new Date(j.tgl_kegiatan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                </td>
                                <td>
                                    <strong>${j.nama_kegiatan}</strong>
                                    ${j.keterangan ? `<div style="font-size:0.8rem; color:var(--text-muted)">${j.keterangan}</div>` : ""}
                                </td>
                                <td style="font-size:0.85rem;">
                                    <div style="font-weight:700;">${j.author || "Admin"}</div>
                                    <div style="color:var(--text-muted); font-size:0.75rem;">${j.posyandu || "Global"}</div>
                                </td>
                                <td><i class="fas fa-map-marker-alt" style="color:var(--danger)"></i> ${j.tempat}</td>
                                <td>${statusBadge}</td>
                                <td>
                                    <div style="display:flex; gap:5px;">
                                        <a href="#/jadwal_form?id=${j.id}" class="btn btn-outline btn-sm"><i class="fas fa-edit"></i></a>
                                        <button 
                                            onclick="window.deleteJadwal(${j.id}, this.getAttribute('data-name'))" 
                                            data-name="${j.nama_kegiatan.replace(/"/g, "&quot;")}"
                                            class="btn btn-outline btn-sm" 
                                            style="color:var(--danger);">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            `;
                                })
                                .join("")
                            : '<tr><td colspan="5" style="text-align:center; padding:2rem;">Belum ada jadwal.</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

window.render_jadwal_form = async (id) => {
  const content = document.getElementById("page-content");
  let data = {
    nama_kegiatan: "",
    tgl_kegiatan: "",
    tempat: "",
    keterangan: "",
  };
  if (id)
    data = await db.fetch("SELECT * FROM jadwal_posyandu WHERE id = ?", [id]);

  content.innerHTML = `
        <div class="card form-card">
            <div class="card-header"><h3 class="card-title"><i class="fas fa-calendar-plus" style="color:var(--primary)"></i> ${id ? "Edit" : "Tambah"} Jadwal</h3></div>
            <form id="jadwalForm">
                <div class="form-group">
                    <label>Nama Kegiatan</label>
                    <input type="text" id="j_nama" value="${data.nama_kegiatan}" required placeholder="Contoh: Posyandu Balita RW 01">
                </div>
                <div class="grid-stack grid-cols-2">
                    <div class="form-group">
                        <label>Tanggal Kegiatan</label>
                        <input type="date" id="j_tgl" value="${data.tgl_kegiatan}" required>
                    </div>
                    <div class="form-group">
                        <label>Tempat / Lokasi</label>
                        <input type="text" id="j_tempat" value="${data.tempat}" required placeholder="Contoh: Balai RW 01">
                    </div>
                </div>
                <div class="form-group">
                    <label>Keterangan Tambahan</label>
                    <textarea id="j_ket" placeholder="Opsional...">${data.keterangan || ""}</textarea>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="button" onclick="history.back()" class="btn btn-outline" style="flex:1;">Batal</button>
                    <button type="submit" class="btn btn-primary" style="flex:2;">Simpan Jadwal</button>
                </div>
            </form>
        </div>
    `;

  document.getElementById("jadwalForm").onsubmit = async (e) => {
    e.preventDefault();
    const vals = [
      document.getElementById("j_nama").value,
      document.getElementById("j_tgl").value,
      document.getElementById("j_tempat").value,
      document.getElementById("j_ket").value,
    ];

    try {
      let res;
      if (id) {
        res = await db.execute(
          "UPDATE jadwal_posyandu SET nama_kegiatan=?, tgl_kegiatan=?, tempat=?, keterangan=? WHERE id=?",
          [...vals, id],
        );
      } else {
        const user = Auth.getUser();
        res = await db.execute(
          "INSERT INTO jadwal_posyandu (nama_kegiatan, tgl_kegiatan, tempat, keterangan, author, posyandu) VALUES (?, ?, ?, ?, ?, ?)",
          [...vals, user.name, user.posyandu || "Global"],
        );
      }

      // CEK STATUS RESULT DARI SERVER
      if (res && res.status === "error") {
        throw new Error(
          res.message || "Gagal menyimpan ke database (Unknown Error).",
        );
      }

      if (id) db.log("UPDATE_JADWAL", `Mengupdate jadwal: ${vals[0]}`);
      else db.log("ADD_JADWAL", `Menambah jadwal baru: ${vals[0]}`);

      alert("Jadwal berhasil disimpan!");
      window.location.hash = "#/jadwal";
    } catch (err) {
      console.error(err);
      alert(
        "Gagal menyimpan jadwal.\n\nDetail Error: " +
          err.message +
          "\n\nSOLUSI: Pastikan Anda sudah membuat Sheet/Tabel bernama 'jadwal_posyandu' di database Google Sheet Anda sesuai panduan.",
      );
    }
  };
};

window.deleteJadwal = async (id, name) => {
  if (confirm("Hapus jadwal ini?")) {
    await db.execute("DELETE FROM jadwal_posyandu WHERE id = ?", [id]);
    db.log("DELETE_JADWAL", `Menghapus jadwal: ${name}`);
    window.render_jadwal();
  }
};

// --- PENGUMUMAN ---
window.render_pengumuman = async () => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat pengumuman...</div>';

  let list = [];
  try {
    list = await db.query("SELECT * FROM pengumuman ORDER BY created_at DESC");
  } catch (e) {
    console.error("Error fetching pengumuman:", e);
  }

  content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <h3 class="card-title"><i class="fas fa-bullhorn" style="color:var(--secondary)"></i> Pengumuman</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Kelola pengumuman yang tampil di halaman depan.</p>
                </div>
                <a href="#/pengumuman_form" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Tambah Pengumuman</a>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th><i class="fas fa-clock"></i> Tgl Input</th>
                            <th><i class="fas fa-heading"></i> Judul</th>
                            <th><i class="fas fa-user-check"></i> Petugas</th>
                            <th><i class="fas fa-align-left"></i> Isi</th>
                            <th><i class="fas fa-toggle-on"></i> Status</th>
                            <th><i class="fas fa-cog"></i> Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          list.length
                            ? list
                                .map((p) => {
                                  const date =
                                    p.created_at &&
                                    !isNaN(new Date(p.created_at).getTime())
                                      ? new Date(
                                          p.created_at,
                                        ).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "-";
                                  return `
                            <tr>
                                <td>${date}</td>
                                <td><strong>${p.judul}</strong></td>
                                <td style="font-size:0.85rem;">
                                    <div style="font-weight:700;">${p.author || "Admin"}</div>
                                    <div style="color:var(--text-muted); font-size:0.75rem;">${p.posyandu || "Global"}</div>
                                </td>
                                <td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.isi}</td>
                                <td><span class="badge ${p.status === "Aktif" ? "badge-success" : "badge-secondary"}">${p.status || "Aktif"}</span></td>
                                <td>
                                    <div style="display:flex; gap:5px;">
                                        <a href="#/pengumuman_form?id=${p.id}" class="btn btn-outline btn-sm"><i class="fas fa-edit"></i></a>
                                        <button onclick="window.deletePengumuman('${p.id}', '${p.judul.replace(/'/g, "\\'")}')" class="btn btn-outline btn-sm" style="color:var(--danger);"><i class="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                            `;
                                })
                                .join("")
                            : '<tr><td colspan="5" style="text-align:center; padding:2rem;">Belum ada pengumuman.</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

window.render_pengumuman_form = async (id) => {
  const content = document.getElementById("page-content");
  let data = { judul: "", isi: "", status: "Aktif" };

  if (id) {
    data = await db.fetch("SELECT * FROM pengumuman WHERE id = ?", [id]);
  }

  content.innerHTML = `
        <div class="card form-card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-bullhorn" style="color:var(--secondary)"></i> ${id ? "Edit" : "Tambah"} Pengumuman</h3>
            </div>
            <form id="pengumumanForm">
                <div class="form-group">
                    <label>Judul Pengumuman</label>
                    <input type="text" id="p_judul" value="${data.judul}" required placeholder="Contoh: Jadwal Imunisasi Tambahan">
                </div>
                <div class="form-group">
                    <label>Konten / Isi Pengumuman</label>
                    <textarea id="p_isi" required style="height:150px;" placeholder="Tulis rincian pengumuman di sini...">${data.isi}</textarea>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="p_status">
                        <option value="Aktif" ${data.status === "Aktif" ? "selected" : ""}>Aktif (Tampil)</option>
                        <option value="Nonaktif" ${data.status === "Nonaktif" ? "selected" : ""}>Nonaktif (Sembunyikan)</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="button" onclick="history.back()" class="btn btn-outline" style="flex:1;">Batal</button>
                    <button type="submit" class="btn btn-primary" style="flex:2;">Simpan Pengumuman</button>
                </div>
            </form>
        </div>
    `;

  document.getElementById("pengumumanForm").onsubmit = async (e) => {
    e.preventDefault();
    const vals = {
      judul: document.getElementById("p_judul").value,
      isi: document.getElementById("p_isi").value,
      status: document.getElementById("p_status").value,
    };

    try {
      if (id) {
        await db.execute(
          "UPDATE pengumuman SET judul=?, isi=?, status=? WHERE id=?",
          [vals.judul, vals.isi, vals.status, id],
        );
        db.log("UPDATE_PENGUMUMAN", `Update pengumuman: ${vals.judul}`);
      } else {
        const user = Auth.getUser();
        await db.execute(
          "INSERT INTO pengumuman (judul, isi, status, author, posyandu) VALUES (?, ?, ?, ?, ?)",
          [
            vals.judul,
            vals.isi,
            vals.status,
            user.name,
            user.posyandu || "Global",
          ],
        );
        db.log(
          "ADD_PENGUMUMAN",
          `Tambah pengumuman: ${vals.judul} oleh ${user.name}`,
        );
      }
      alert("Pengumuman berhasil disimpan!");
      window.location.hash = "#/pengumuman";
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pengumuman: " + err.message);
    }
  };
};

window.deletePengumuman = async (id, title) => {
  if (confirm(`Hapus pengumuman "${title}"?`)) {
    try {
      await db.execute("DELETE FROM pengumuman WHERE id = ?", [id]);
      db.log("DELETE_PENGUMUMAN", `Hapus pengumuman: ${title}`);
      window.render_pengumuman();
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  }
};

// --- ACTIVITY LOGS ---
window.render_activity_logs = async () => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat log aktivitas...</div>';

  const logs = await db.query(
    "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50",
  );

  content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-history" style="color:var(--primary)"></i> Log Aktivitas Sistem</h3>
            </div>
            <div class="table-responsive">
                <table style="font-size: 0.9rem;">
                    <thead>
                        <tr>
                            <th>Waktu</th>
                            <th>User</th>
                            <th>Aksi</th>
                            <th>Relasi Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          logs.length
                            ? logs
                                .map(
                                  (l) => `
                            <tr>
                                <td style="color:var(--text-muted)">${l.created_at}</td>
                                <td><span class="badge badge-info">${l.username || "System"}</span></td>
                                <td><strong>${l.action}</strong></td>
                                <td style="font-size:0.8rem; color:var(--text-muted)">${l.details || "-"}</td>
                            </tr>
                        `,
                                )
                                .join("")
                            : '<tr><td colspan="4" style="text-align:center; padding:2rem;">Belum ada log terekam.</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

// --- PENGATURAN POSYANDU ---
window.render_pengaturan = async () => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat pengaturan...</div>';

  const settings = await db.query("SELECT * FROM settings");
  const sMap = {};
  settings.forEach((s) => (sMap[s.setting_key] = s.setting_value));

  content.innerHTML = `
        <div class="card form-card">
            <div class="card-header">
                <div>
                    <h3 class="card-title"><i class="fas fa-cog" style="color:var(--primary)"></i> Pengaturan Sistem</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Konfigurasi identitas posyandu Anda.</p>
                </div>
            </div>
            <form id="settingsForm">
                <div class="form-group">
                    <label>Nama Posyandu</label>
                    <input type="text" id="s_app_name" value="${sMap["app_name"] || ""}" placeholder="E-KMS Posyandu Mawar">
                </div>
                <div class="form-group">
                    <label>Nama Kelurahan / Desa</label>
                    <input type="text" id="s_kel" value="${sMap["kelurahan"] || ""}" placeholder="Nama Kelurahan">
                </div>
                <div class="form-group">
                    <label>Kecamatan</label>
                    <input type="text" id="s_kec" value="${sMap["kecamatan"] || ""}" placeholder="Nama Kecamatan">
                </div>
                <div class="form-group">
                    <label>Alamat Sekretariat</label>
                    <textarea id="s_alamat" placeholder="Alamat lengkap posyandu...">${sMap["alamat"] || ""}</textarea>
                </div>
                <div style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 2rem;">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-save"></i> Simpan Seluruh Pengaturan
                    </button>
                </div>
            </form>
        </div>
    `;

  document.getElementById("settingsForm").onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      app_name: document.getElementById("s_app_name").value,
      kelurahan: document.getElementById("s_kel").value,
      kecamatan: document.getElementById("s_kec").value,
      alamat: document.getElementById("s_alamat").value,
    };

    for (const [key, val] of Object.entries(data)) {
      // Check if exists logic could be here, but standard UPDATE is assumed fine for existing keys
      // Use INSERT ON DUPLICATE if SQL supports it, or simple UPDATE
      await db.execute(
        "UPDATE settings SET setting_value=? WHERE setting_key=?",
        [val, key],
      );
    }

    // Update Local UI immediately
    if (data.app_name) {
      const brand = document.querySelector(".sidebar-brand");
      if (brand)
        brand.innerHTML = `<div class="sidebar-icon"><i class="fas fa-baby-carriage"></i></div> ${data.app_name}`;
    }

    db.log("UPDATE_SETTINGS", "Mengubah pengaturan sistem");
    alert("Pengaturan Berhasil Diperbarui!");
  };
};

// --- ANAK DETAIL (KMS ENGINE) ---
// --- ANAK DETAIL (KMS ENGINE) ---
// Simplified WHO Standards (SD -3, -2, 0, +2, +3) for Boys (L) and Girls (P)
// Data points: [SD-3(Red), SD-2(Yellow), Median(Green), SD+2(Yellow), SD+3(Red)]
const WHO_CURVE = {
  L: {
    0: [2.1, 2.5, 3.3, 4.4, 5.0],
    6: [5.7, 6.4, 7.9, 9.8, 10.9],
    12: [6.9, 7.7, 9.6, 12.0, 13.3],
    24: [8.1, 9.0, 11.3, 14.3, 16.0],
    36: [10.0, 11.3, 14.3, 18.3, 20.0],
    48: [11.2, 12.7, 16.3, 21.2, 23.6],
    60: [12.1, 14.1, 18.3, 24.2, 27.9],
  },
  P: {
    0: [2.0, 2.4, 3.2, 4.2, 4.8],
    6: [5.1, 5.7, 7.3, 9.3, 10.6],
    12: [6.3, 7.0, 8.9, 11.5, 13.1],
    24: [7.5, 8.5, 10.7, 13.8, 15.6],
    36: [9.0, 10.2, 13.9, 17.6, 19.3],
    48: [10.2, 11.7, 16.1, 21.2, 23.0],
    60: [10.9, 12.6, 18.2, 24.9, 27.3],
  },
};

// Helper: Interpolate curve data for chart
function getCurveData(gender, index) {
  const data = WHO_CURVE[gender] || WHO_CURVE["L"];
  const months = [0, 6, 12, 24, 36, 48, 60];
  return months.map((m) => ({ x: m, y: data[m][index] }));
}

window.render_anak_detail = async (id) => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat data lengkap KMS...</div>';

  // 1. Fetch Data
  const safeQ = async (q, p) => {
    try {
      return await db.query(q, p);
    } catch (e) {
      return [];
    }
  };
  let anak, history, imunisasi, vitamin, obatCacing, perkembangan;

  try {
    anak = await db.fetch("SELECT * FROM anak WHERE id = ?", [id]);

    // Calculate current age in months
    if (anak && anak.tgl_lahir) {
      const birth = new Date(anak.tgl_lahir);
      const today = new Date();
      let months = (today.getFullYear() - birth.getFullYear()) * 12;
      months += today.getMonth() - birth.getMonth();
      if (today.getDate() < birth.getDate()) {
        months--;
      }
      anak.usia_bulan = Math.max(0, months);
    }

    // Fetch history and calculate age at measurement time manually
    let historyRaw = await db.query(
      "SELECT * FROM penimbangan WHERE anak_id = ? ORDER BY tgl_ukur DESC",
      [id],
    );

    if (anak && historyRaw) {
      history = historyRaw.map((h) => {
        const birth = new Date(anak.tgl_lahir);
        const measure = new Date(h.tgl_ukur);
        // Calculate difference in months
        let months =
          (measure.getFullYear() - birth.getFullYear()) * 12 +
          (measure.getMonth() - birth.getMonth());
        // Adjust if day of month of measure is less than day of month of birth ? usually KMS uses completed months
        if (measure.getDate() < birth.getDate()) months--;

        return { ...h, usia_bulan: months >= 0 ? months : 0 };
      });
    } else {
      history = [];
    }

    [imunisasi, vitamin, obatCacing, perkembangan] = await Promise.all([
      safeQ(
        "SELECT * FROM imunisasi WHERE anak_id = ? ORDER BY tgl_diberikan DESC",
        [id],
      ),
      safeQ(
        "SELECT * FROM vitamin WHERE anak_id = ? ORDER BY created_at DESC",
        [id],
      ),
      safeQ(
        "SELECT * FROM obat_cacing WHERE anak_id = ? ORDER BY tgl_diberikan DESC",
        [id],
      ),
      safeQ(
        "SELECT * FROM perkembangan_anak WHERE anak_id = ? ORDER BY tgl_catat DESC",
        [id],
      ),
    ]);
  } catch (e) {
    console.error(e);
  }

  if (!anak)
    return (content.innerHTML =
      '<div class="alert alert-danger">Data anak tidak ditemukan.</div>');

  // Multi-tenancy check
  const user = Auth.getUser();
  if (user.role === "kader" && anak.posyandu !== user.posyandu) {
    return (content.innerHTML = `
      <div class="alert alert-danger" style="padding: 3rem; text-align: center;">
          <i class="fas fa-lock" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
          <h2 style="margin-bottom: 0.5rem;">Akses Ditolak</h2>
          <p>Maaf, Anda tidak memiliki izin untuk melihat data anak dari wilayah <strong>${anak.posyandu || "-"}</strong>.<br>
          Wilayah tugas Anda adalah: <strong>${user.posyandu}</strong></p>
          <button onclick="history.back()" class="btn btn-primary" style="margin-top: 1.5rem;">Kembali</button>
      </div>
    `);
  }

  // 2. Render Main Layout
  content.innerHTML = `
        <!-- PROFILE HEADER -->
        <div class="card" style="border-left: 5px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="display:flex; gap:1.5rem; align-items:flex-start;">
                    <div class="user-avatar" style="width:80px; height:80px; font-size:2rem;">${anak.nama[0]}</div>
                    <div>
                        <h2 style="font-family:'Outfit'; margin:0; line-height:1.2;">${anak.nama}</h2>
                        <div style="margin: 0.5rem 0; display:flex; flex-wrap:wrap; gap:0.5rem;">
                            <span class="badge badge-info"><i class="fas fa-id-card"></i> ${anak.nik}</span>
                            <span class="badge ${anak.jenis_kelamin == "L" ? "badge-primary" : "badge-danger"}"><i class="fas fa-venus-mars"></i> ${anak.jenis_kelamin == "L" ? "Laki-laki" : "Perempuan"}</span>
                            <span class="badge badge-warning"><i class="fas fa-notes-medical"></i> ${anak.status_bpjs || "Umum"}</span>
                            <span class="badge badge-secondary"><i class="fas fa-birthday-cake"></i> ${anak.tgl_lahir}</span>
                        </div>
                        <div style="color:var(--text-muted); font-size:0.9rem; line-height:1.4;">
                            <div><i class="fas fa-ruler-vertical"></i> Lahir: <strong>${anak.berat_lahir} kg</strong> / <strong>${anak.panjang_lahir || "-"} cm</strong> (Anak ke-${anak.anak_ke || "-"})</div>
                            <div><i class="fas fa-user-friends"></i> Ibu: <strong>${anak.nama_ibu}</strong> (${anak.usia_ibu || "-"} thn) &bull; ${anak.pekerjaan_ibu || "-"}</div>
                            <div><i class="fas fa-map-marker-alt"></i> ${anak.alamat}</div>
                        </div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.4rem; font-weight:700; color:var(--primary); line-height:1.2;">
                        ${window.helper_calculateDetailedAge(anak.tgl_lahir)}
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Usia Saat Ini (${anak.usia_bulan} Bulan)</div>
                    <div style="margin-top:0.5rem;">
                         <span class="badge ${anak.status_aktif ? "badge-success" : "badge-dark"}">${anak.status_aktif ? "Aktif" : "Non-Aktif"}</span>
                    </div>
                </div>
            </div>
            <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border); display:flex; gap:0.5rem;">
                <button class="btn btn-outline btn-sm" onclick="history.back()"><i class="fas fa-arrow-left"></i> Kembali</button>
                <a href="#/anak_form?id=${id}" class="btn btn-outline btn-sm"><i class="fas fa-edit"></i> Edit Profil Lengkap</a>
            </div>
        </div>

        <!-- TABS NAV -->
        <div style="margin: 1.5rem 0 1rem 0; display:flex; gap:0.5rem; overflow-x:auto;">
            <button class="btn btn-primary btn-sm nav-tab-btn" onclick="showTab('tab-ukur', this)"><i class="fas fa-weight"></i> Pertumbuhan</button>
            <button class="btn btn-outline btn-sm nav-tab-btn" onclick="showTab('tab-imun', this)"><i class="fas fa-syringe"></i> Imunisasi & Obat</button>
            <button class="btn btn-outline btn-sm nav-tab-btn" onclick="showTab('tab-kembang', this)"><i class="fas fa-shapes"></i> Perkembangan</button>
        </div>

        <!-- TAB CONTENT CONTAINERS -->
        <div id="tab-ukur" class="tab-content"></div>
        <div id="tab-imun" class="tab-content" style="display:none;"></div>
        <div id="tab-kembang" class="tab-content" style="display:none;"></div>
    `;

  // 3. Mount Sub-Components
  if (window.render_kms_tab_growth) render_kms_tab_growth(id, anak, history);
  if (window.render_kms_tab_imun)
    render_kms_tab_imun(id, imunisasi, vitamin, obatCacing, []);
  if (window.render_kms_tab_dev) render_kms_tab_dev(id, perkembangan, anak);

  // Global Tab Switcher
  window.showTab = (id, btn) => {
    document
      .querySelectorAll(".tab-content")
      .forEach((e) => (e.style.display = "none"));
    document.getElementById(id).style.display = "block";
    document.querySelectorAll(".nav-tab-btn").forEach((b) => {
      b.classList.remove("btn-primary");
      b.classList.add("btn-outline");
    });
    btn.classList.remove("btn-outline");
    btn.classList.add("btn-primary");
  };
};

// --- SUB-RENDERER: GROWTH / PERTUMBUHAN ---
window.render_kms_tab_growth = (id, anak, history) => {
  const container = document.getElementById("tab-ukur");
  const today = new Date().toISOString().split("T")[0];
  const chartData = [...history].sort((a, b) => a.usia_bulan - b.usia_bulan);

  container.innerHTML = `
        <div class="grid-stack grid-cols-2">
            <!-- INPUT FORM -->
            <div class="card fade-in">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-weight-scale" style="color:var(--accent)"></i> Input Pengukuran</h3>
                </div>
                <form id="measureForm">
                    <div class="grid-stack grid-cols-2" style="gap:1rem;">
                        <div class="enhanced-input-group">
                            <label>Tanggal Ukur</label>
                            <input type="date" id="m_tgl" required value="${today}">
                        </div>
                        <div class="enhanced-input-group">
                            <label>Berat Badan (kg)</label>
                            <input type="number" step="0.01" id="m_bb" required placeholder="0.00">
                        </div>
                        <div class="enhanced-input-group">
                            <label>Tinggi Badan (cm)</label>
                            <input type="number" step="0.1" id="m_tb" placeholder="0.0">
                        </div>
                        <div class="enhanced-input-group">
                            <label>Lingkar Kepala (cm)</label>
                            <input type="number" step="0.1" id="m_lk" placeholder="0.0">
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-app); border-radius: 12px; padding: 1.25rem; margin: 1rem 0; border: 1px solid #e2e8f0;">
                        <div style="display:flex; gap:1.5rem; margin-bottom:1rem; flex-wrap: wrap;">
                            <label style="display:flex; align-items:center; gap:0.75rem; cursor:pointer; font-weight:600; color:var(--txt-soft);">
                                <input type="checkbox" id="m_asi" style="width:18px; height:18px;"> ASI Eksklusif
                            </label>
                            <label style="display:flex; align-items:center; gap:0.75rem; cursor:pointer; font-weight:600; color:var(--txt-soft);">
                                <input type="checkbox" id="m_pmt" style="width:18px; height:18px;"> Dapat PMT
                            </label>
                        </div>
                        <div class="enhanced-input-group" style="margin-bottom:0;">
                            <input type="text" id="m_tindakan" placeholder="Catatan medis, tindakan, atau nasihat kader..." style="background:white;">
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width:100%; height: 48px; justify-content: center; font-size: 1rem;">
                        <i class="fas fa-cloud-upload"></i> Simpan Hasil Pengukuran
                    </button>
                </form>
            </div>
            
            <!-- CHART -->
            <div class="card fade-in">
                 <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-chart-line" style="color:var(--success)"></i> Grafik Perkembangan (BB/U)</h3>
                 </div>
                 <div style="height:320px; padding: 10px;"><canvas id="kmsChartGen"></canvas></div>
            </div>
        </div>

        <!-- HISTORY TABLE -->
        <div class="card fade-in" style="margin-top:2rem;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-history" style="color:var(--secondary)"></i> Riwayat Pengukuran Lengkap</h3>
                <div class="badge badge-info">${history.length} Data</div>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Usia</th>
                            <th>BB (kg)</th>
                            <th>TB (cm)</th>
                            <th>LK (cm)</th>
                            <th>Status Gizi</th>
                            <th>Keterangan</th>
                            ${Auth.getUser().role == "admin" ? "<th style='text-align:right;'>Aksi</th>" : ""}
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          history.length
                            ? history
                                .map(
                                  (h) => `
                            <tr>
                                <td style="font-weight:600; color:var(--txt-soft);">${new Date(h.tgl_ukur).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                                <td style="font-weight:700;">${h.usia_bulan} bln</td>
                                <td style="color:var(--accent); font-weight:800; font-size:1rem;">${h.berat_badan}</td>
                                <td>${h.tinggi_badan || "-"}</td>
                                <td>${h.lingkar_kepala || "-"}</td>
                                <td>
                                    <span class="badge ${h.status_gizi?.includes("Baik") ? "badge-success" : h.status_gizi?.includes("Buruk") || h.status_gizi?.includes("2T") ? "badge-danger" : "badge-warning"}">
                                        ${h.status_gizi || "-"}
                                    </span>
                                </td>
                                <td><small style="color:var(--txt-soft); font-weight:500;">${h.asi_eksklusif == "Ya" ? "<b>ASI</b> • " : ""}${h.tindakan || "-"}</small></td>
                                ${
                                  Auth.getUser().role == "admin"
                                    ? `
                                <td style="text-align:right;">
                                    <button onclick="editPengukuran(${h.id}, '${h.tgl_ukur}', ${h.berat_badan}, '${h.tinggi_badan || ""}', '${h.lingkar_kepala || ""}', '${h.asi_eksklusif || ""}', '${h.tindakan || ""}')" class="btn btn-sm btn-outline" style="width:32px; height:32px; padding:0; justify-content:center;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>`
                                    : ""
                                }
                            </tr>`,
                                )
                                .join("")
                            : '<tr><td colspan="8" style="text-align:center; padding:4rem; color:var(--txt-muted);">Belum ada riwayat pengukuran.</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;

  // Edit Handler
  window.editPengukuran = (hid, tgl, bb, tb, lk, asi, ket) => {
    document.getElementById("m_tgl").value = tgl.split("T")[0];
    document.getElementById("m_bb").value = bb;
    document.getElementById("m_tb").value = tb;
    document.getElementById("m_lk").value = lk;
    document.getElementById("m_asi").checked = asi === "Ya";
    document.getElementById("m_tindakan").value = ket;

    const form = document.getElementById("measureForm");
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!confirm("Simpan perubahan data ini?")) return;

      let status = "Baik";
      if (document.getElementById("m_bb").value < 3) status = "Buruk";

      await db.execute(
        "UPDATE penimbangan SET tgl_ukur=?, berat_badan=?, tinggi_badan=?, lingkar_kepala=?, status_gizi=?, asi_eksklusif=?, tindakan=? WHERE id=?",
        [
          document.getElementById("m_tgl").value,
          document.getElementById("m_bb").value,
          document.getElementById("m_tb").value,
          document.getElementById("m_lk").value,
          status,
          document.getElementById("m_asi").checked ? "Ya" : "Tidak",
          document.getElementById("m_tindakan").value,
          hid,
        ],
      );
      window.render_anak_detail(id);
    };
    // Scroll to form
    form.scrollIntoView({ behavior: "smooth" });
    alert(
      "Mode Edit Aktif: Ubah data pada formulir di atas lalu tekan Simpan.",
    );
  };

  // Initialize Chart
  // Initialize Chart
  const ctx = document.getElementById("kmsChartGen").getContext("2d");
  const gender = anak.jenis_kelamin === "P" ? "P" : "L"; // Default L

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [0, 6, 12, 24, 36, 48, 60],
      datasets: [
        {
          label: "Anak Ini",
          data: chartData.map((h) => ({
            x: Number(h.usia_bulan),
            y: h.berat_badan,
          })),
          borderColor: "#000",
          borderWidth: 3,
          tension: 0.3,
          pointBackgroundColor: "#000",
        },
        // SD Zones (Stacked Area)
        {
          label: "SD+3",
          data: getCurveData(gender, 4),
          borderColor: "transparent",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          fill: "+1",
          pointRadius: 0,
          tension: 0.4,
        }, // Red Top
        {
          label: "SD+2",
          data: getCurveData(gender, 3),
          borderColor: "transparent",
          backgroundColor: "rgba(245, 158, 11, 0.2)",
          fill: "+1",
          pointRadius: 0,
          tension: 0.4,
        }, // Yellow Top
        {
          label: "Median",
          data: getCurveData(gender, 2),
          borderColor: "rgba(34, 197, 94, 0.5)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          fill: "+1",
          pointRadius: 0,
          tension: 0.4,
        }, // Green Top
        {
          label: "SD-2",
          data: getCurveData(gender, 1),
          borderColor: "transparent",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          fill: "+1",
          pointRadius: 0,
          tension: 0.4,
        }, // Green Bottom
        {
          label: "SD-3",
          data: getCurveData(gender, 0),
          borderColor: "transparent",
          backgroundColor: "rgba(245, 158, 11, 0.2)",
          fill: "origin",
          pointRadius: 0,
          tension: 0.4,
        }, // Yellow Bottom
        {
          label: "Bawah",
          data: getCurveData(gender, 0).map((d) => ({ x: d.x, y: 0 })),
          borderColor: "transparent",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          fill: "-1",
          pointRadius: 0,
        }, // Red Bottom (Trick)
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          min: 0,
          max: 60,
          title: { display: true, text: "Usia (Bulan)" },
        },
        y: { min: 0, title: { display: true, text: "Berat Badan (kg)" } },
      },
      plugins: {
        legend: {
          labels: {
            filter: function (item, chart) {
              // Only show 'Anak Ini' and generic 'Area KMS' logic if desired, or simplified
              return item.text === "Anak Ini" || item.text === "Median";
            },
          },
        },
        tooltip: {
          filter: function (tooltipItem) {
            return tooltipItem.datasetIndex === 0; // Only tooltip for Child Data
          },
        },
      },
    },
  });

  // Handle Submit
  document.getElementById("measureForm").onsubmit = async (e) => {
    e.preventDefault();
    const tgl = document.getElementById("m_tgl").value;
    const bb = parseFloat(document.getElementById("m_bb").value);
    const tb = document.getElementById("m_tb").value;
    const lk = document.getElementById("m_lk").value;
    const asi = document.getElementById("m_asi").checked ? "Ya" : "Tidak";

    let pmt = document.getElementById("m_pmt").checked ? "Dapat PMT. " : "";
    let note = document.getElementById("m_tindakan").value;
    let finalTindakan = pmt + note;

    // 1. Status Gizi Check (Simplified logic for demo, ideally uses WHO Z-Score Tables)
    let status = "Baik";
    if (bb < 3) status = "Buruk";
    else if (bb < 5) status = "Kurang";

    // 2. Check 2T (Berat Badan Tidak Naik / Turun)
    // History is sorted DESC (newest first). prev is the last record before this one.
    // Note: 'history' variable is available from outer scope
    const prev = history.length > 0 ? history[0] : null;
    let is2T = false;
    if (prev && bb <= parseFloat(prev.berat_badan)) {
      is2T = true;
      status = status === "Baik" ? "Kurang (2T)" : status; // Downgrade status if logical
      finalTindakan += " [PERINGATAN 2T: BB Tidak Naik]";
    }

    try {
      await db.execute(
        "INSERT INTO penimbangan (anak_id, tgl_ukur, berat_badan, tinggi_badan, lingkar_kepala, status_gizi, asi_eksklusif, tindakan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, tgl, bb, tb, lk, status, asi, finalTindakan],
      );

      // AUTO ALERTS
      // A. Gizi Buruk/Kurang
      if (status.includes("Buruk") || status.includes("Kurang")) {
        const alertMsg = `PERINGATAN GIZI: Anak ${anak.nama} status ${status} (BB: ${bb}kg). Harap Intervensi.`;
        await db.execute(
          "INSERT INTO alerts (anak_id, message, is_read) VALUES (?, ?, 0)",
          [id, alertMsg],
        );
      }
      // B. 2T Alert
      if (is2T) {
        const alertMsg2T = `PERINGATAN 2T: Anak ${anak.nama} berat badan tidak naik 2x berturut-turut/turun. Cek Riwayat.`;
        await db.execute(
          "INSERT INTO alerts (anak_id, message, is_read) VALUES (?, ?, 0)",
          [id, alertMsg2T],
        );
      }

      db.log("ADD_TIMBANG", `Menimbang anak ID: ${id}. Status: ${status}`);
      window.render_anak_detail(id);
    } catch (err) {
      alert("Gagal simpan: " + err);
    }
  };
};

function initKmsChart(id, anak, chartData) {
  const ctx = document.getElementById("kmsChartGen").getContext("2d");
  const gender = anak.jenis_kelamin === "P" ? "P" : "L";
  new Chart(ctx, {
    type: "line",
    data: {
      labels: Array.from({ length: 61 }, (_, i) => i),
      datasets: [
        {
          label: "Anak Ini",
          data: chartData.map((h) => ({
            x: Number(h.usia_bulan),
            y: h.berat_badan,
          })),
          borderColor: "var(--primary)",
          borderWidth: 4,
          tension: 0.3,
          pointBackgroundColor: "var(--primary)",
          pointRadius: 4,
          zIndex: 10,
        },
        {
          label: "Median",
          data: getCurveData(gender, 2),
          borderColor: "rgba(34, 197, 94, 0.4)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: "+1",
          pointRadius: 0,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          min: 0,
          max: 60,
          title: { display: true, text: "Usia (Bulan)" },
        },
        y: { min: 0, title: { display: true, text: "BB (kg)" } },
      },
      plugins: {
        legend: {
          labels: {
            filter: (i) => i.text === "Anak Ini" || i.text === "Median",
          },
        },
      },
    },
  });
}

// --- SUB-RENDERER: IMUNISASI & VITAMIN/OBAT CACING ---
window.render_kms_tab_imun = (id, imunisasi, vitamin, obatCacing) => {
  const container = document.getElementById("tab-imun");
  const today = new Date().toISOString().split("T")[0];

  container.innerHTML = `
        <div class="grid-stack grid-cols-2">
            <!-- LEFT: IMUNISASI -->
            <div class="card fade-in">
                 <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-syringe" style="color:var(--accent)"></i> Riwayat Imunisasi</h3>
                 </div>
                 <div class="table-responsive" style="max-height:350px; overflow:auto; margin-bottom: 1.5rem; border:none;">
                    <table>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Jenis Vaksin</th>
                                <th>Ket</th>
                                ${Auth.getUser().role == "admin" ? "<th style='text-align:right;'>Aksi</th>" : ""}
                            </tr>
                        </thead>
                        <tbody>
                            ${
                              imunisasi && imunisasi.length
                                ? imunisasi
                                    .map(
                                      (i) => `
                            <tr>
                                <td style="font-weight:600;">${i.tgl_diberikan}</td>
                                <td><span class="badge badge-info">${i.jenis_imunisasi}</span></td>
                                <td><small style="color:var(--txt-muted)">${i.keterangan || "-"}</small></td>
                                ${
                                  Auth.getUser().role == "admin"
                                    ? `
                                <td style="text-align:right;">
                                    <button onclick="editImunisasi(${i.id}, '${i.jenis_imunisasi}', '${i.tgl_diberikan}', '${i.keterangan || ""}')" class="btn btn-sm btn-outline" style="width:30px; height:30px; padding:0; justify-content:center;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>`
                                    : ""
                                }
                            </tr>`,
                                    )
                                    .join("")
                                : '<tr><td colspan="4" style="text-align:center; padding:3rem; color:var(--txt-muted);">Belum ada data imunisasi.</td></tr>'
                            }
                        </tbody>
                    </table>
                 </div>
                 
                 <div style="background: var(--bg-app); border-radius: 12px; padding: 1.25rem; border: 1px solid #e2e8f0;">
                    <h4 style="font-size: 0.85rem; font-weight: 800; color: var(--txt-soft); text-transform: uppercase; margin-bottom: 1rem;">Tambah Imunisasi</h4>
                    <form id="imunForm">
                        <div class="enhanced-input-group" style="margin-bottom: 0.75rem;">
                            <select id="im_jenis" required>
                                 <option value="" disabled selected>Pilih Jenis Vaksin...</option>
                                 <option value="Hepatitis B (0 Bulan)">💉 Hb0 (0-24 jam)</option>
                                 <option value="BCG (1 Bulan)">💉 BCG</option>
                                 <option value="Polio 1 (1 Bulan)">💉 Polio 1</option>
                                 <option value="DPT-HB-Hib 1 (2 Bulan)">💉 DPT-HB-Hib 1</option>
                                 <option value="Polio 2 (2 Bulan)">💉 Polio 2</option>
                                 <option value="DPT-HB-Hib 2 (3 Bulan)">💉 DPT-HB-Hib 2</option>
                                 <option value="Polio 3 (3 Bulan)">💉 Polio 3</option>
                                 <option value="DPT-HB-Hib 3 (4 Bulan)">💉 DPT-HB-Hib 3</option>
                                 <option value="Polio 4 (4 Bulan)">💉 Polio 4</option>
                                 <option value="IPV (4 Bulan)">💉 IPV (Polio Suntik)</option>
                                 <option value="Campak/MR (9 Bulan)">💉 Campak / MR</option>
                                 <option value="DPT-HB-Hib Lanjutan (18 Bulan)">💉 DPT-HB-Hib Lanjutan</option>
                                 <option value="Campak/MR Lanjutan (18 Bulan)">💉 Campak / MR Lanjutan</option>
                            </select>
                        </div>
                        <div style="display:flex; gap:0.75rem; align-items: flex-end;">
                            <div class="enhanced-input-group" style="flex:1; margin-bottom:0;">
                                <input type="date" id="im_tgl" required value="${today}">
                            </div>
                            <div class="enhanced-input-group" style="flex:2; margin-bottom:0;">
                                <input type="text" id="im_ket" placeholder="Keterangan / Batch...">
                            </div>
                            <button type="submit" class="btn btn-primary" style="height:44px;"><i class="fas fa-save"></i></button>
                        </div>
                    </form>
                 </div>
            </div>

            <!-- RIGHT: VITAMIN A & OBAT CACING (DISTINCT) -->
            <div class="grid-stack" style="gap:1.5rem;">
                <!-- VITAMIN A -->
                <div class="card fade-in" style="border-left: 4px solid #ef4444;">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-capsules" style="color:#ef4444"></i> Suplementasi Vitamin A</h3>
                    </div>
                    <div class="table-responsive" style="max-height:160px; overflow:auto; margin-bottom:1rem; border:none;">
                        <table>
                            <tbody>
                                ${
                                  vitamin && vitamin.length
                                    ? vitamin
                                        .map(
                                          (v) => `
                                <tr>
                                    <td style="font-weight:700; font-size: 0.85rem;">${v.tgl_diberikan}</td>
                                    <td><span class="badge ${v.jenis_vitamin == "Kapsul Biru" ? "badge-info" : "badge-danger"}">Vit A ${v.jenis_vitamin}</span></td>
                                    ${
                                      Auth.getUser().role == "admin"
                                        ? `
                                    <td style="text-align:right;">
                                        <button onclick="editObat(${v.id}, '${v.jenis_vitamin}', '${v.tgl_diberikan}', 'vitamin', '${v.keterangan || ""}')" class="btn btn-sm btn-outline" style="width:26px; height:26px; padding:0; justify-content:center;">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>`
                                        : ""
                                    }
                                </tr>`,
                                        )
                                        .join("")
                                    : "<tr><td colspan='3' style='text-align:center; color:var(--txt-muted); padding:1rem;'>Belum ada data Vitamin A.</td></tr>"
                                }
                            </tbody>
                        </table>
                    </div>
                    <form id="vitFormDetail" style="background: #fff5f5; padding: 1rem; border-radius: 12px; border: 1px solid #fee2e2;">
                        <div style="display:flex; gap:0.5rem; flex-wrap: wrap;">
                            <select id="vd_jenis" required style="flex:1; min-width: 120px;">
                                <option value="Kapsul Biru">Kapsul Biru (6-11 bln)</option>
                                <option value="Kapsul Merah">Kapsul Merah (12-59 bln)</option>
                            </select>
                            <input type="date" id="vd_tgl" value="${today}" required style="width:135px;">
                            <button type="submit" class="btn btn-primary" style="background:#ef4444; height:44px;"><i class="fas fa-plus"></i></button>
                        </div>
                    </form>
                </div>

                <!-- OBAT CACING -->
                <div class="card fade-in" style="border-left: 4px solid #8b5cf6;">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-pills" style="color:#8b5cf6"></i> Pemberian Obat Cacing</h3>
                    </div>
                    <div class="table-responsive" style="max-height:160px; overflow:auto; margin-bottom:1rem; border:none;">
                        <table>
                            <tbody>
                                ${
                                  obatCacing && obatCacing.length
                                    ? obatCacing
                                        .map(
                                          (o) => `
                                <tr>
                                    <td style="font-weight:700; font-size:0.85rem;">${o.tgl_diberikan}</td>
                                    <td><span class="badge" style="background:#f5f3ff; color:#5b21b6;">Deworming</span></td>
                                    <td style="font-size: 0.8rem; color: var(--txt-muted);">${o.jenis_obat}</td>
                                    ${
                                      Auth.getUser().role == "admin"
                                        ? `
                                    <td style="text-align:right;">
                                        <button onclick="editObat(${o.id}, '${o.jenis_obat}', '${o.tgl_diberikan}', 'obat_cacing', '${o.keterangan || ""}')" class="btn btn-sm btn-outline" style="width:26px; height:26px; padding:0; justify-content:center;">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>`
                                        : ""
                                    }
                                </tr>`,
                                        )
                                        .join("")
                                    : "<tr><td colspan='4' style='text-align:center; color:var(--txt-muted); padding:1rem;'>Belum ada data Obat Cacing.</td></tr>"
                                }
                            </tbody>
                        </table>
                    </div>
                    <form id="obatForm" style="background: #f5f3ff; padding: 1rem; border-radius: 12px; border: 1px solid #ede9fe;">
                        <div style="display:flex; gap:0.5rem; flex-wrap: wrap;">
                            <input type="text" id="oc_jenis" placeholder="Nama Obat" value="Albendazole" required style="flex:1; min-width: 120px;">
                            <input type="date" id="oc_tgl" value="${today}" required style="width:135px;">
                            <button type="submit" class="btn btn-primary" style="background:#8b5cf6; height:44px;"><i class="fas fa-plus"></i></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

  // Submit Handlers
  document.getElementById("imunForm").onsubmit = async (e) => {
    e.preventDefault();
    await db.execute(
      "INSERT INTO imunisasi (anak_id, jenis_imunisasi, tgl_diberikan, keterangan) VALUES (?, ?, ?, ?)",
      [
        id,
        document.getElementById("im_jenis").value,
        document.getElementById("im_tgl").value,
        document.getElementById("im_ket").value,
      ],
    );
    db.log("ADD_IMUNISASI", `Anak ID: ${id}`);
    window.render_anak_detail(id);
  };

  document.getElementById("vitFormDetail").onsubmit = async (e) => {
    e.preventDefault();
    await db.execute(
      "INSERT INTO vitamin (anak_id, jenis_vitamin, tgl_diberikan, keterangan) VALUES (?, ?, ?, ?)",
      [
        id,
        document.getElementById("vd_jenis").value,
        document.getElementById("vd_tgl").value,
        "", // Keterangan removed from form
      ],
    );
    db.log("ADD_VITAMIN", `Anak ID: ${id}`);
    window.render_anak_detail(id);
  };

  document.getElementById("obatForm").onsubmit = async (e) => {
    e.preventDefault();
    await db.execute(
      "INSERT INTO obat_cacing (anak_id, jenis_obat, tgl_diberikan, keterangan) VALUES (?, ?, ?, ?)",
      [
        id,
        document.getElementById("oc_jenis").value,
        document.getElementById("oc_tgl").value,
        "", // Keterangan removed from form
      ],
    );
    db.log("ADD_OBAT_CACING", `Anak ID: ${id}`);
    window.render_anak_detail(id);
  };

  // Edit Handlers
  window.editImunisasi = (iid, jenis, tgl, ket) => {
    document.getElementById("im_jenis").value = jenis;
    document.getElementById("im_tgl").value = tgl.split("T")[0];
    document.getElementById("im_ket").value = ket;
    document.getElementById("imunForm").onsubmit = async (e) => {
      e.preventDefault();
      if (!confirm("Simpan perubahan imunisasi?")) return;
      await db.execute(
        "UPDATE imunisasi SET jenis_imunisasi=?, tgl_diberikan=?, keterangan=? WHERE id=?",
        [
          document.getElementById("im_jenis").value,
          document.getElementById("im_tgl").value,
          document.getElementById("im_ket").value,
          iid,
        ],
      );
      window.render_anak_detail(id);
    };
    alert("Mode Edit Imunisasi Aktif.");
  };

  window.editObat = (oid, jenis, tgl, table, ket = "") => {
    if (table === "obat_cacing") {
      document.getElementById("oc_jenis").value = jenis;
      document.getElementById("oc_tgl").value = tgl.split("T")[0]; // Ensure date format
      document.getElementById("obatForm").onsubmit = async (e) => {
        e.preventDefault();
        if (!confirm("Simpan perubahan obat cacing?")) return;
        await db.execute(
          "UPDATE obat_cacing SET jenis_obat=?, tgl_diberikan=? WHERE id=?",
          [
            document.getElementById("oc_jenis").value,
            document.getElementById("oc_tgl").value,
            oid,
          ],
        );
        window.render_anak_detail(id);
      };
      alert("Mode Edit Obat Cacing Aktif.");
    } else {
      document.getElementById("vd_jenis").value = jenis;
      document.getElementById("vd_tgl").value = tgl.split("T")[0]; // Ensure date format
      document.getElementById("vitFormDetail").onsubmit = async (e) => {
        e.preventDefault();
        if (!confirm("Simpan perubahan vitamin A?")) return;
        await db.execute(
          "UPDATE vitamin SET jenis_vitamin=?, tgl_diberikan=? WHERE id=?",
          [
            document.getElementById("vd_jenis").value,
            document.getElementById("vd_tgl").value,
            oid,
          ],
        );
        window.render_anak_detail(id);
      };
      alert("Mode Edit Vitamin A Aktif.");
    }
  };
};

// --- SUB-RENDERER: PERKEMBANGAN (SDIDTK) ---
window.render_kms_tab_dev = (id, perkembangan, anak) => {
  const container = document.getElementById("tab-kembang");
  const today = new Date().toISOString().split("T")[0];

  container.innerHTML = `
        <div class="grid-stack grid-cols-2">
            <div class="card fade-in">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-brain" style="color:var(--accent)"></i> Cek KPSP (SDIDTK)</h3>
                </div>
                <form id="devForm">
                    <div class="grid-stack grid-cols-2" style="gap:1rem; margin-bottom:1.5rem;">
                        <div class="enhanced-input-group">
                            <label>Tanggal Periksa</label>
                            <input type="date" id="dev_tgl" required value="${today}">
                        </div>
                        <div class="enhanced-input-group">
                            <label>Hasil Kesimpulan</label>
                            <select id="dev_hasil" required>
                                <option value="Sesuai">✅ Sesuai Usia</option>
                                <option value="Meragukan">⚠️ Meragukan</option>
                                <option value="Penyimpangan">🔴 Penyimpangan</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="background:var(--bg-app); border-radius:12px; padding:1.25rem; border:1px solid #e2e8f0; margin-bottom:1.5rem;">
                        <h4 style="font-size:0.8rem; font-weight:800; color:var(--txt-soft); text-transform:uppercase; margin-bottom:1rem; display:flex; align-items:center; gap:8px;">
                            <i class="fas fa-tasks"></i> Detail Perkembangan
                        </h4>
                        <div class="grid-stack grid-cols-2" style="gap:1rem;">
                            <div class="enhanced-input-group" style="margin-bottom:0.5rem;">
                                <label style="font-size:0.7rem;">Motorik Kasar</label>
                                <select id="dev_mk"><option>Normal</option><option>Terlambat</option></select>
                            </div>
                            <div class="enhanced-input-group" style="margin-bottom:0.5rem;">
                                <label style="font-size:0.7rem;">Motorik Halus</label>
                                <select id="dev_mh"><option>Normal</option><option>Terlambat</option></select>
                            </div>
                            <div class="enhanced-input-group" style="margin-bottom:0.5rem;">
                                <label style="font-size:0.7rem;">Bicara & Bahasa</label>
                                <select id="dev_bb"><option>Normal</option><option>Terlambat</option></select>
                            </div>
                            <div class="enhanced-input-group" style="margin-bottom:0.5rem;">
                                <label style="font-size:0.7rem;">Sosialisasi</label>
                                <select id="dev_sos"><option>Normal</option><option>Terlambat</option></select>
                            </div>
                        </div>
                    </div>

                    <div class="enhanced-input-group">
                        <label>Tindakan / Intervensi</label>
                        <textarea id="dev_act" placeholder="Saran stimulasi atau rujukan medis..." style="min-height:80px;"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%; height:48px;"><i class="fas fa-save"></i> Simpan Hasil SDIDTK</button>
                </form>
            </div>
            
            <div class="card fade-in">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-history" style="color:var(--secondary)"></i> Riwayat SDIDTK</h3>
                    <div class="badge badge-info">${perkembangan.length} Data</div>
                </div>
                <div class="table-responsive" style="max-height:450px; overflow:auto; border:none;">
                    <table>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Usia</th>
                                <th>Hasil</th>
                                ${Auth.getUser().role == "admin" ? "<th style='text-align:right;'>Aksi</th>" : ""}
                            </tr>
                        </thead>
                        <tbody>
                            ${
                              perkembangan && perkembangan.length
                                ? perkembangan
                                    .map(
                                      (p) => `
                            <tr>
                                <td style="font-weight:600;">${p.tgl_periksa}</td>
                                <td>${p.usia_bulan} bln</td>
                                <td>
                                    <span class="badge ${p.hasil_pemeriksaan == "Sesuai" ? "badge-success" : p.hasil_pemeriksaan == "Meragukan" ? "badge-warning" : "badge-danger"}">
                                        ${p.hasil_pemeriksaan}
                                    </span>
                                    <div style="font-size:0.7rem; color:var(--txt-muted); margin-top:4px;">${p.tindakan_intervensi || "-"}</div>
                                </td>
                                ${
                                  Auth.getUser().role == "admin"
                                    ? `
                                <td style="text-align:right;">
                                    <button onclick="editSDIDTK(${p.id}, '${p.tgl_periksa}', '${p.hasil_pemeriksaan}', '${p.motorik_kasar}', '${p.motorik_halus}', '${p.bicara_bahasa}', '${p.sosialisasi}', '${p.tindakan_intervensi || ""}')" class="btn btn-sm btn-outline" style="width:30px; height:30px; padding:0; justify-content:center;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>`
                                    : ""
                                }
                            </tr>`,
                                    )
                                    .join("")
                                : '<tr><td colspan="4" style="text-align:center; padding:3rem; color:var(--txt-muted);">Belum ada riwayat.</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

  // SDIDTK Submit Handler
  document.getElementById("devForm").onsubmit = async (e) => {
    e.preventDefault();
    const tgl = document.getElementById("dev_tgl").value;
    const hasil = document.getElementById("dev_hasil").value;
    const mk = document.getElementById("dev_mk").value;
    const mh = document.getElementById("dev_mh").value;
    const bb = document.getElementById("dev_bb").value;
    const sos = document.getElementById("dev_sos").value;
    const act = document.getElementById("dev_act").value;

    const diff = new Date(tgl) - new Date(anak.tgl_lahir);
    const usia_bulan = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));

    try {
      await db.execute(
        "INSERT INTO perkembangan (anak_id, tgl_periksa, usia_bulan, hasil_pemeriksaan, motorik_kasar, motorik_halus, bicara_bahasa, sosialisasi, tindakan_intervensi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, tgl, usia_bulan, hasil, mk, mh, bb, sos, act],
      );
      db.log("ADD_PERKEMBANGAN", `Anak ID: ${id}, Hasil: ${hasil}`);
      window.render_anak_detail(id);
    } catch (err) {
      alert("Gagal: " + err);
    }
  };

  window.editSDIDTK = (pid, tgl, hasil, mk, mh, bb, sos, act) => {
    document.getElementById("dev_tgl").value = tgl.split("T")[0];
    document.getElementById("dev_hasil").value = hasil;
    document.getElementById("dev_mk").value = mk;
    document.getElementById("dev_mh").value = mh;
    document.getElementById("dev_bb").value = bb;
    document.getElementById("dev_sos").value = sos;
    document.getElementById("dev_act").value = act;

    const form = document.getElementById("devForm");
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!confirm("Simpan perubahan data perkembangan?")) return;
      await db.execute(
        "UPDATE perkembangan_anak SET tgl_catat=?, hasil_sdidtk=?, motorik_kasar=?, motorik_halus=?, bicara_bahasa=?, sosialisasi=?, tindakan=? WHERE id=?",
        [
          document.getElementById("dev_tgl").value,
          document.getElementById("dev_hasil").value,
          document.getElementById("dev_mk").value,
          document.getElementById("dev_mh").value,
          document.getElementById("dev_bb").value,
          document.getElementById("dev_sos").value,
          document.getElementById("dev_act").value,
          pid,
        ],
      );
      window.render_anak_detail(id);
    };
    form.scrollIntoView({ behavior: "smooth" });
    alert("Silakan edit di form SDIDTK, lalu simpan.");
  };
};

// --- USER MANAGEMENT ---
window.render_users = async () => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat data pengguna...</div>';

  const users = await db.query("SELECT * FROM users ORDER BY created_at DESC");

  content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-users" style="color:var(--primary)"></i> Manajemen Pengguna</h3>
                <a href="#/user_form" class="btn btn-primary btn-sm"><i class="fas fa-user-plus"></i> Tambah User</a>
            </div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>Nama / Username</th><th>Role</th><th>Wilayah</th><th>Aksi</th></tr></thead>
                    <tbody>
                        ${
                          users.length
                            ? users
                                .map(
                                  (u) => `
                            <tr>
                                <td>
                                    <div style="font-weight:600">${u.nama_lengkap || u.username}</div>
                                    <div style="font-size:0.8rem; color:var(--text-muted);">@${u.username}</div>
                                </td>
                                <td><span class="badge ${u.role == "admin" ? "badge-danger" : u.role == "kader" ? "badge-success" : "badge-info"}">${u.role}</span></td>
                                <td><span style="font-size:0.9rem; font-weight:500;">${u.posyandu || "-"}</span></td>
                                <td>
                                    <a href="#/user_form?id=${u.id}" class="btn btn-outline btn-sm"><i class="fas fa-edit"></i></a>
                                    ${u.username !== "admin" ? `<button onclick="window.deleteUser(${u.id})" class="btn btn-outline btn-sm" style="color:var(--danger)"><i class="fas fa-trash"></i></button>` : ""}
                                </td>
                            </tr>
                        `,
                                )
                                .join("")
                            : '<tr><td colspan="4">Belum ada user.</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

window.deleteUser = async (id) => {
  if (confirm("Hapus user ini?")) {
    await db.execute("DELETE FROM users WHERE id=?", [id]);
    window.render_users();
  }
};

// --- POSYANDU MANAGEMENT ---
window.render_posyandu_list = async () => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat wilayah posyandu...</div>';

  let list = [];
  try {
    list = await db.query(
      "SELECT * FROM wilayah_posyandu ORDER BY nama_posyandu ASC",
    );
  } catch (e) {
    console.error("Error posyandu list:", e);
  }

  content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-map-location-dot" style="color:var(--secondary)"></i> Daftar Wilayah Posyandu</h3>
                <a href="#/posyandu_form" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Tambah Wilayah</a>
            </div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>Nama Posyandu</th><th>Keterangan</th><th>Aksi</th></tr></thead>
                    <tbody>
                        ${
                          list.length
                            ? list
                                .map(
                                  (p) => `
                            <tr>
                                <td><div style="font-weight:700; color:var(--primary);">${p.nama_posyandu}</div></td>
                                <td style="color:var(--text-muted); font-size:0.9rem;">${p.keterangan || "-"}</td>
                                <td>
                                    <a href="#/posyandu_form?id=${p.id}" class="btn btn-outline btn-sm"><i class="fas fa-edit"></i></a>
                                    <button onclick="window.deletePosyandu(${p.id}, '${p.nama_posyandu}')" class="btn btn-outline btn-sm" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `,
                                )
                                .join("")
                            : '<tr><td colspan="3" style="text-align:center; padding:2rem;">Belum ada wilayah posyandu terdaftar.</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

window.render_posyandu_form = async (id) => {
  const content = document.getElementById("page-content");
  let data = { nama_posyandu: "", keterangan: "" };
  if (id)
    data = await db.fetch("SELECT * FROM wilayah_posyandu WHERE id = ?", [id]);

  content.innerHTML = `
        <div class="card form-card">
            <div class="card-header"><h3 class="card-title">${id ? "Edit" : "Tambah"} Wilayah Posyandu</h3></div>
            <form id="posyanduForm">
                <div class="form-group">
                    <label>Nama Posyandu</label>
                    <input type="text" id="p_nama" value="${data.nama_posyandu}" required placeholder="Contoh: Melati 1 / Teratai A">
                </div>
                <div class="form-group">
                    <label>Keterangan / Alamat Wilayah</label>
                    <textarea id="p_ket" placeholder="Opsional: Keterangan wilayah tugas..." style="min-height:100px;">${data.keterangan || ""}</textarea>
                </div>
                <div style="margin-top:2rem; display:flex; gap:1rem;">
                    <button type="button" onclick="history.back()" class="btn btn-outline" style="flex:1">Batal</button>
                    <button type="submit" class="btn btn-primary" style="flex:2">Simpan Wilayah</button>
                </div>
            </form>
        </div>
    `;

  document.getElementById("posyanduForm").onsubmit = async (e) => {
    e.preventDefault();
    const nm = document.getElementById("p_nama").value;
    const kt = document.getElementById("p_ket").value;

    try {
      if (id) {
        await db.execute(
          "UPDATE wilayah_posyandu SET nama_posyandu=?, keterangan=? WHERE id=?",
          [nm, kt, id],
        );
        db.log("EDIT_POSYANDU", `Edit wilayah: ${nm}`);
      } else {
        await db.execute(
          "INSERT INTO wilayah_posyandu (nama_posyandu, keterangan) VALUES (?, ?)",
          [nm, kt],
        );
        db.log("ADD_POSYANDU", `Tambah wilayah: ${nm}`);
      }
      window.location.hash = "#/posyandu_list";
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    }
  };
};

window.deletePosyandu = async (id, name) => {
  if (
    confirm(
      `Hapus wilayah "${name}"?\nPerhatian: Pastikan tidak ada User atau Anak yang masih terikat dengan wilayah ini.`,
    )
  ) {
    try {
      await db.execute("DELETE FROM wilayah_posyandu WHERE id=?", [id]);
      db.log("DELETE_POSYANDU", `Hapus wilayah: ${name}`);
      window.render_posyandu_list();
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  }
};

window.render_user_form = async (id) => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat data user...</div>';

  let posyandus = [];
  try {
    posyandus = await db.query(
      "SELECT nama_posyandu FROM wilayah_posyandu ORDER BY nama_posyandu ASC",
    );
  } catch (e) {}

  let data = {
    username: "",
    password: "",
    role: "kader",
    nama_lengkap: "",
    posyandu: "",
  };
  if (id) data = await db.fetch("SELECT * FROM users WHERE id = ?", [id]);

  content.innerHTML = `
        <div class="card form-card">
            <div class="card-header"><h3 class="card-title">${id ? "Edit" : "Tambah"} Pengguna</h3></div>
            <form id="userForm">
                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" id="u_name" value="${data.nama_lengkap}" required>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="u_user" value="${data.username}" required>
                </div>
                <div class="form-group">
                    <label>Password ${id ? "(Kosongkan jika tidak diubah)" : ""}</label>
                    <input type="password" id="u_pass" ${id ? "" : "required"}>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="u_role">
                        <option value="admin" ${data.role == "admin" ? "selected" : ""}>Admin (Full Akses)</option>
                        <option value="kader" ${data.role == "kader" ? "selected" : ""}>Kader (Input Data)</option>
                        <option value="orangtua" ${data.role == "orangtua" ? "selected" : ""}>Orang Tua (View Only)</option>
                    </select>
                </div>
                <div class="form-group" id="user_posyandu_group">
                    <label>Wilayah Posyandu</label>
                    <select id="u_posyandu">
                        <option value="">- Pilih Wilayah -</option>
                        ${posyandus.map((p) => `<option value="${p.nama_posyandu}" ${data.posyandu == p.nama_posyandu ? "selected" : ""}>${p.nama_posyandu}</option>`).join("")}
                    </select>
                    <small style="color:var(--text-muted);">Pilih wilayah tugas kader. Jika admin, bisa dikosongkan.</small>
                </div>
                <div style="margin-top:2rem;">
                    <button type="submit" class="btn btn-primary" style="width:100%">Simpan User</button>
                </div>
            </form>
        </div>
    `;

  document.getElementById("userForm").onsubmit = async (e) => {
    e.preventDefault();
    const nm = document.getElementById("u_name").value;
    const us = document.getElementById("u_user").value;
    const ps = document.getElementById("u_pass").value;
    const rl = document.getElementById("u_role").value;
    const py = document.getElementById("u_posyandu").value;

    if (id) {
      let q =
        "UPDATE users SET nama_lengkap=?, username=?, role=?, posyandu=? WHERE id=?";
      let p = [nm, us, rl, py, id];
      if (ps) {
        q =
          "UPDATE users SET nama_lengkap=?, username=?, password=?, role=?, posyandu=? WHERE id=?";
        p = [nm, us, ps, rl, py, id];
      }
      await db.execute(q, p);
    } else {
      await db.execute(
        "INSERT INTO users (nama_lengkap, username, password, role, posyandu) VALUES (?, ?, ?, ?, ?)",
        [nm, us, ps, rl, py],
      );
    }
    window.location.hash = "#/users";
  };
};

window.deleteUser = async (id) => {
  if (confirm("Hapus user ini?")) {
    await db.execute("DELETE FROM users WHERE id=?", [id]);
    window.render_users();
  }
};

// --- ALERTS ---
window.render_alerts = async () => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Memuat notifikasi...</div>';

  // In a real app we'd join with Anak name, but simple fetch for now
  const user = Auth.getUser();
  const isKader = user.role === "kader";
  let sql = "SELECT a.*, k.nama FROM alerts a JOIN anak k ON a.anak_id = k.id";
  let params = [];

  if (isKader) {
    sql += " WHERE k.posyandu = ?";
    params.push(user.posyandu);
  }

  sql += " ORDER BY a.created_at DESC";
  const alerts = await db.query(sql, params);

  content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-bell" style="color:var(--orange)"></i> Peringatan & Notifikasi</h3>
            </div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>Anak</th><th>Pesan</th><th>Status</th></tr></thead>
                    <tbody>
                        ${
                          alerts.length
                            ? alerts
                                .map(
                                  (a) => `
                            <tr style="${a.is_read == 0 ? "background: #fff8f0;" : ""}">
                                <td><strong>${a.nama}</strong></td>
                                <td>${a.message}</td>
                                <td>
                                    ${
                                      Number(a.is_read) === 0
                                        ? `<button onclick="window.markRead(${a.id})" class="btn btn-sm btn-outline">Tandai Dibaca</button>`
                                        : '<span class="badge badge-success">Sudah Dibaca</span>'
                                    }
                                </td>
                            </tr>
                        `,
                                )
                                .join("")
                            : '<tr><td colspan="3" style="text-align:center;">Tidak ada notifikasi.</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

window.markRead = async (id) => {
  await db.execute("UPDATE alerts SET is_read=1 WHERE id=?", [id]);
  window.render_alerts();
};

// --- LAPORAN SKDN ---
window.render_laporan = async () => {
  const content = document.getElementById("page-content");
  content.innerHTML = '<div class="card">Menghitung Laporan SKDN...</div>';

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  const user = Auth.getUser();
  const isKader = user.role === "kader";

  // Fetch data with proper queries
  let childSql = "SELECT id FROM anak WHERE status_aktif=1";
  let childParams = [];
  if (isKader) {
    childSql += " AND posyandu = ?";
    childParams.push(user.posyandu);
  }
  const allAnak = (await db.query(childSql, childParams)) || [];
  const S = allAnak.length; // Seluruh balita aktif
  const K = S; // Semua balita dianggap punya KMS

  // Get unique children who weighed this month
  let weighSql = "SELECT DISTINCT p.anak_id FROM penimbangan p";
  let weighParams = [
    `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`,
    `${currentYear}-${String(currentMonth === 12 ? 1 : currentMonth + 1).padStart(2, "0")}-01`,
  ];

  if (isKader) {
    weighSql +=
      " JOIN anak k ON p.anak_id = k.id WHERE k.posyandu = ? AND p.tgl_ukur >= ? AND p.tgl_ukur < ?";
    weighParams = [user.posyandu, ...weighParams];
  } else {
    weighSql += " WHERE p.tgl_ukur >= ? AND p.tgl_ukur < ?";
  }

  const thisMonthWeighings = (await db.query(weighSql, weighParams)) || [];
  const D = thisMonthWeighings.length; // Ditimbang bulan ini

  // Calculate N (Naik berat badan)
  // Get last 2 months of weighing data
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const recentWeights =
    (await db.query(
      "SELECT anak_id, berat_badan, tgl_ukur FROM penimbangan WHERE tgl_ukur >= ? ORDER BY anak_id, tgl_ukur DESC",
      [`${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-01`],
    )) || [];

  // Group by child and calculate who gained weight
  const history = {};
  recentWeights.forEach((r) => {
    if (!history[r.anak_id]) history[r.anak_id] = [];
    history[r.anak_id].push(r);
  });

  let N = 0;
  Object.values(history).forEach((recs) => {
    recs.sort((a, b) => new Date(b.tgl_ukur) - new Date(a.tgl_ukur));
    if (recs.length >= 2) {
      const current = recs[0];
      const prev = recs[1];
      // Check if current is THIS month
      const currentRecordMonth = new Date(current.tgl_ukur).getMonth();
      if (
        currentRecordMonth === now.getMonth() &&
        parseFloat(current.berat_badan) > parseFloat(prev.berat_badan)
      )
        N++;
    }
  });

  content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <h3 class="card-title">Laporan SKDN</h3>
                    <p style="color:var(--text-muted); font-size:0.9rem;">Bulan: ${now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>
                </div>
                <button class="btn btn-outline btn-sm" onclick="window.print()"><i class="fas fa-print"></i> Cetak</button>
            </div>
            
            <div class="grid-stack grid-cols-4" style="text-align:center; gap: 1rem; margin-top:1rem;">
                <div style="background:var(--success-bg); padding:1.5rem; border-radius:12px; border:1px solid var(--success);">
                    <div style="font-size:2.5rem; font-weight:700; color:var(--success);">S</div>
                    <div style="font-size:1.5rem; font-weight:700;">${S}</div>
                    <div style="font-size:0.8rem;">Seluruh Balita</div>
                </div>
                <div style="background:var(--info-bg); padding:1.5rem; border-radius:12px; border:1px solid var(--info);">
                    <div style="font-size:2.5rem; font-weight:700; color:var(--info);">K</div>
                    <div style="font-size:1.5rem; font-weight:700;">${K}</div>
                    <div style="font-size:0.8rem;">Punya KMS</div>
                </div>
                <div style="background:var(--warning-bg); padding:1.5rem; border-radius:12px; border:1px solid var(--warning);">
                    <div style="font-size:2.5rem; font-weight:700; color:var(--warning);">D</div>
                    <div style="font-size:1.5rem; font-weight:700;">${D}</div>
                    <div style="font-size:0.8rem;">Partisipasi (${S > 0 ? ((D / S) * 100).toFixed(0) : 0}%)</div>
                </div>
                <div style="background:var(--secondary-bg); padding:1.5rem; border-radius:12px; border:1px solid var(--secondary);">
                    <div style="font-size:2.5rem; font-weight:700; color:var(--secondary);">N</div>
                    <div style="font-size:1.5rem; font-weight:700;">${N}</div>
                    <div style="font-size:0.8rem;">Naik Berat Badan</div>
                </div>
            </div>
        </div>
    `;
};

// --- CEK KMS (PUBLIK) ---
window.render_cek_kms = () => {
  const content = document.getElementById("page-content");
  content.innerHTML = `
        <div class="auth-container" style="min-height:auto; padding:0;">
            <div class="card" style="width:100%; max-width:500px; margin:0 auto; padding:2rem;">
                <div class="card-header" style="text-align:center; display:block;">
                    <div class="sidebar-icon" style="margin: 0 auto 1rem; width: 50px; height: 50px; font-size: 1.5rem;"><i class="fas fa-search"></i></div>
                    <h3 class="card-title">Cek Data KMS</h3>
                    <p style="color:var(--text-muted);">Masukkan NIK Balita untuk melihat grafik.</p>
                </div>
                <div style="margin-top:1.5rem;">
                    <div class="form-group">
                        <input type="text" id="public_nik" maxlength="16" placeholder="Contoh: 3171..." style="font-size:1.2rem; text-align:center; letter-spacing:2px;" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                    </div>
                    <button class="btn btn-primary" style="width:100%;" onclick="window.doPublicCheck()">Cari Data</button>
                    <div id="public_result" style="margin-top:2rem;"></div>
                </div>
            </div>
        </div>
    `;
};

window.doPublicCheck = async () => {
  const nik = document.getElementById("public_nik").value;
  const div = document.getElementById("public_result");
  if (!nik) return alert("Masukkan NIK Balita");
  if (nik.length !== 16) return alert("NIK harus berjumlah 16 digit");

  div.innerHTML =
    '<div style="text-align:center; padding:2rem;"><i class="fas fa-spinner fa-spin" style="font-size:2rem; color:var(--primary);"></i><p style="margin-top:1rem; color:var(--text-muted);">Mencari data...</p></div>';

  const child = await db.fetch("SELECT * FROM anak WHERE nik = ?", [nik]);
  if (!child)
    return (div.innerHTML =
      '<div class="alert alert-danger"><i class="fas fa-times-circle"></i> Data tidak ditemukan. Periksa kembali NIK yang dimasukkan.</div>');

  // Fetch all related data IN PARALLEL (much faster!)
  const [history, imunisasi, vitaminA, perkembangan, jadwal] =
    await Promise.all([
      db.query(
        "SELECT * FROM penimbangan WHERE anak_id = ? ORDER BY tgl_ukur ASC",
        [child.id],
      ),
      db.query(
        "SELECT * FROM imunisasi WHERE anak_id = ? ORDER BY tgl_diberikan DESC",
        [child.id],
      ),
      db.query(
        "SELECT * FROM vitamin WHERE anak_id = ? ORDER BY tgl_diberikan DESC",
        [child.id],
      ),
      db.query(
        "SELECT * FROM perkembangan WHERE anak_id = ? ORDER BY tgl_periksa DESC LIMIT 3",
        [child.id],
      ),
      db.query(
        "SELECT * FROM jadwal_posyandu WHERE tgl_kegiatan >= ? ORDER BY tgl_kegiatan ASC LIMIT 3",
        [new Date().toISOString().split("T")[0]],
      ),
    ]);

  // Calculate age
  const birthDate = new Date(child.tgl_lahir);
  const today = new Date();
  let ageMonths = (today.getFullYear() - birthDate.getFullYear()) * 12;
  ageMonths += today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) ageMonths--;

  const ageYears = Math.floor(ageMonths / 12);
  const remainingMonths = ageMonths % 12;
  const ageText =
    ageYears > 0
      ? `${ageYears} tahun ${remainingMonths} bulan`
      : `${remainingMonths} bulan`;

  // Get latest weight
  const latestWeight =
    history && history.length > 0 ? history[history.length - 1] : null;

  // Prepare Schedule HTML (jadwal already fetched in parallel above)

  let scheduleHtml = "";
  if (jadwal && jadwal.length > 0) {
    scheduleHtml = `
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-calendar-check"></i> Jadwal Posyandu Mendatang</h4>
                </div>
                ${jadwal
                  .map((j) => {
                    const eventDate = new Date(j.tgl_kegiatan);
                    const day = eventDate.getDate();
                    const month = eventDate.toLocaleString("id-ID", {
                      month: "short",
                    });
                    const fullDate = eventDate.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                    return `
                    <div style="background:var(--bg-elevated); border:1px solid var(--border-light); padding:1rem; margin-bottom:0.75rem; border-radius:12px; display:flex; gap:1rem; align-items:center;">
                        <div style="background:var(--primary-gradient); color:white; padding:0.75rem; border-radius:10px; text-align:center; min-width:70px; box-shadow:var(--shadow-sm);">
                            <div style="font-weight:700; font-size:1.5rem; line-height:1;">${day}</div>
                            <div style="font-size:0.75rem; text-transform:uppercase; margin-top:0.25rem;">${month}</div>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:700; font-size:1rem; margin-bottom:0.25rem;">${j.nama_kegiatan || "Kegiatan Posyandu"}</div>
                            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.25rem;"><i class="fas fa-clock"></i> ${fullDate}</div>
                            <div style="font-size:0.85rem; color:var(--text-muted);"><i class="fas fa-map-marker-alt"></i> ${j.tempat || "Lokasi belum ditentukan"}</div>
                        </div>
                    </div>
                `;
                  })
                  .join("")}
            </div>
        `;
  }

  // Immunization HTML
  let imunisasiHtml = "";
  if (imunisasi.length > 0) {
    imunisasiHtml = `
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-syringe"></i> Riwayat Imunisasi</h4>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Jenis Vaksin</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${imunisasi
                              .map(
                                (im) => `
                                <tr>
                                    <td><strong>${new Date(im.tgl_diberikan).toLocaleDateString("id-ID")}</strong></td>
                                    <td><span class="badge badge-info">${im.jenis_imunisasi}</span></td>
                                    <td>${im.keterangan || "-"}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
  } else {
    imunisasiHtml = `
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-syringe"></i> Riwayat Imunisasi</h4>
                </div>
                <div style="text-align:center; padding:2rem; color:var(--text-muted);">
                    <i class="fas fa-info-circle" style="font-size:2rem; margin-bottom:0.5rem;"></i>
                    <p>Belum ada data imunisasi tercatat.</p>
                </div>
            </div>
        `;
  }

  // Vitamin A HTML
  let vitaminHtml = "";
  if (vitaminA.length > 0) {
    vitaminHtml = `
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-pills"></i> Riwayat Vitamin A</h4>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Jenis Kapsul</th>
                                <th>Bulan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${vitaminA
                              .map((v) => {
                                const badge =
                                  v.jenis_vitamin === "Biru"
                                    ? "badge-info"
                                    : "badge-warning";
                                return `
                                <tr>
                                    <td><strong>${new Date(v.tgl_diberikan).toLocaleDateString("id-ID")}</strong></td>
                                    <td><span class="badge ${badge}">${v.jenis_vitamin}</span></td>
                                    <td>${v.keterangan || "-"}</td>
                                </tr>
                            `;
                              })
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
  } else {
    vitaminHtml = `
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-pills"></i> Riwayat Vitamin A</h4>
                </div>
                <div style="text-align:center; padding:2rem; color:var(--text-muted);">
                    <i class="fas fa-info-circle" style="font-size:2rem; margin-bottom:0.5rem;"></i>
                    <p>Belum ada data pemberian Vitamin A.</p>
                </div>
            </div>
        `;
  }

  // Development HTML
  let perkembanganHtml = "";
  if (perkembangan.length > 0) {
    perkembanganHtml = `
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-child"></i> Perkembangan Terbaru (KPSP)</h4>
                </div>
                ${perkembangan
                  .map((p) => {
                    let statusColor = "success";
                    if (p.hasil === "Meragukan") statusColor = "warning";
                    if (p.hasil === "Penyimpangan") statusColor = "danger";

                    return `
                    <div style="background:var(--bg-elevated); border-left:4px solid var(--${statusColor}); padding:1rem; margin-bottom:0.75rem; border-radius:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                            <strong>${new Date(p.tgl_periksa).toLocaleDateString("id-ID")}</strong>
                            <span class="badge badge-${statusColor}">${p.hasil}</span>
                        </div>
                        ${p.keterangan ? `<p style="margin:0; color:var(--text-muted); font-size:0.9rem;">${p.keterangan}</p>` : ""}
                    </div>
                `;
                  })
                  .join("")}
            </div>
        `;
  }

  // ==================== IMMUNIZATION RECOMMENDATION ====================
  // Calculate next immunization based on age and history
  const getNextImmunization = (ageMonths, immunizationHistory) => {
    // Standard Indonesian Immunization Schedule (Kemenkes)
    const schedule = [
      {
        name: "HB-0 (Hepatitis B)",
        ageMonth: 0,
        alias: ["HB-0", "Hepatitis B", "HB 0"],
      },
      { name: "BCG", ageMonth: 1, alias: ["BCG"] },
      { name: "Polio 1", ageMonth: 1, alias: ["Polio 1", "Polio-1"] },
      {
        name: "DPT-HB-Hib 1",
        ageMonth: 2,
        alias: ["DPT-HB-Hib 1", "DPT 1", "Pentavalent 1", "Combo 1"],
      },
      { name: "Polio 2", ageMonth: 2, alias: ["Polio 2", "Polio-2"] },
      {
        name: "DPT-HB-Hib 2",
        ageMonth: 3,
        alias: ["DPT-HB-Hib 2", "DPT 2", "Pentavalent 2", "Combo 2"],
      },
      { name: "Polio 3", ageMonth: 3, alias: ["Polio 3", "Polio-3"] },
      {
        name: "DPT-HB-Hib 3",
        ageMonth: 4,
        alias: ["DPT-HB-Hib 3", "DPT 3", "Pentavalent 3", "Combo 3"],
      },
      { name: "Polio 4", ageMonth: 4, alias: ["Polio 4", "Polio-4"] },
      {
        name: "IPV (Polio Suntik)",
        ageMonth: 4,
        alias: ["IPV", "Polio Suntik"],
      },
      {
        name: "Campak/MR 1",
        ageMonth: 9,
        alias: ["Campak", "MR", "MR 1", "Campak 1", "Measles"],
      },
      {
        name: "DPT-HB-Hib Booster",
        ageMonth: 18,
        alias: ["Booster", "DPT Booster", "DPT-HB-Hib 4"],
      },
      { name: "Campak/MR 2", ageMonth: 18, alias: ["MR 2", "Campak 2"] },
    ];

    // Get list of completed immunizations (case-insensitive match with aliases)
    const completed = new Set();
    immunizationHistory.forEach((record) => {
      const vaccineGiven = record.jenis_imunisasi?.toLowerCase() || "";
      schedule.forEach((item) => {
        const matched = item.alias.some(
          (alias) =>
            vaccineGiven.includes(alias.toLowerCase()) ||
            alias.toLowerCase().includes(vaccineGiven),
        );
        if (matched) {
          completed.add(item.name);
        }
      });
    });

    // Find next immunization(s) needed
    const pending = [];
    const overdue = [];

    schedule.forEach((item) => {
      if (!completed.has(item.name)) {
        if (ageMonths >= item.ageMonth) {
          // Overdue or due now
          overdue.push({
            ...item,
            status: "overdue",
            message:
              ageMonths > item.ageMonth + 2
                ? `Terlambat (seharusnya ${item.ageMonth} bulan)`
                : `Sudah saatnya!`,
          });
        } else if (ageMonths >= item.ageMonth - 1) {
          // Due soon (within 1 month)
          pending.push({
            ...item,
            status: "upcoming",
            message: `Akan datang (usia ${item.ageMonth} bulan)`,
          });
        }
      }
    });

    return { overdue, pending, completed: Array.from(completed) };
  };

  const nextImunisasi = getNextImmunization(ageMonths, imunisasi);

  // Next Immunization Recommendation HTML
  let nextImunisasiHtml = "";
  if (nextImunisasi.overdue.length > 0 || nextImunisasi.pending.length > 0) {
    nextImunisasiHtml = `
            <div class="card" style="margin-top:1.5rem; border-left:4px solid var(--warning);">
                <div class="card-header" style="background:linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%);">
                    <h4 class="card-title" style="color:var(--warning);">
                        <i class="fas fa-syringe"></i> Rekomendasi Imunisasi untuk Orang Tua
                    </h4>
                </div>
                
                ${
                  nextImunisasi.overdue.length > 0
                    ? `
                    <div style="padding:1.5rem; border-bottom:1px solid var(--border);">
                        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                            <div style="width:40px; height:40px; background:var(--danger-light); color:var(--danger); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div>
                                <div style="font-weight:700; font-size:1rem; color:var(--danger);">Imunisasi yang Perlu Segera Dilakukan</div>
                                <div style="font-size:0.85rem; color:var(--text-muted);">Silakan kunjungi posyandu terdekat</div>
                            </div>
                        </div>
                        ${nextImunisasi.overdue
                          .map(
                            (item) => `
                            <div style="background:var(--danger-light); border-left:3px solid var(--danger); padding:1rem; margin-bottom:0.75rem; border-radius:8px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <div style="font-weight:700; font-size:1rem; margin-bottom:0.25rem;">${item.name}</div>
                                        <div style="font-size:0.85rem; color:var(--text-secondary);">
                                            <i class="fas fa-clock"></i> ${item.message}
                                        </div>
                                    </div>
                                    <span class="badge badge-danger" style="font-size:0.85rem;">PERLU SEGERA</span>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
                
                ${
                  nextImunisasi.pending.length > 0
                    ? `
                    <div style="padding:1.5rem;">
                        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                            <div style="width:40px; height:40px; background:var(--info-light); color:var(--info); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div>
                                <div style="font-weight:700; font-size:1rem; color:var(--info);">Imunisasi yang Akan Datang</div>
                                <div style="font-size:0.85rem; color:var(--text-muted);">Rencanakan kunjungan Anda</div>
                            </div>
                        </div>
                        ${nextImunisasi.pending
                          .map(
                            (item) => `
                            <div style="background:var(--info-light); border-left:3px solid var(--info); padding:1rem; margin-bottom:0.75rem; border-radius:8px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <div style="font-weight:700; font-size:1rem; margin-bottom:0.25rem;">${item.name}</div>
                                        <div style="font-size:0.85rem; color:var(--text-secondary);">
                                            <i class="fas fa-info-circle"></i> ${item.message}
                                        </div>
                                    </div>
                                    <span class="badge badge-info" style="font-size:0.85rem;">SEGERA</span>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
                
                <div style="padding:1rem 1.5rem; background:var(--bg-elevated); border-top:1px solid var(--border); border-radius:0 0 12px 12px;">
                    <div style="display:flex; align-items:start; gap:0.75rem;">
                        <i class="fas fa-lightbulb" style="color:var(--warning); margin-top:0.2rem;"></i>
                        <div style="font-size:0.85rem; color:var(--text-secondary); line-height:1.6;">
                            <strong>Catatan Penting:</strong> Jadwal ini mengacu pada program imunisasi dasar Kementerian Kesehatan RI. 
                            Konsultasikan dengan petugas kesehatan di posyandu untuk informasi lebih lanjut.
                        </div>
                    </div>
                </div>
            </div>
        `;
  } else if (ageMonths >= 18 && nextImunisasi.completed.length > 0) {
    // All immunizations complete
    nextImunisasiHtml = `
            <div class="card" style="margin-top:1.5rem; border-left:4px solid var(--success);">
                <div style="padding:1.5rem; text-align:center;">
                    <div style="width:60px; height:60px; background:var(--success-light); color:var(--success); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 1rem;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4 style="color:var(--success); margin-bottom:0.5rem;">Imunisasi Dasar Lengkap! 🎉</h4>
                    <p style="color:var(--text-muted); margin:0;">
                        Anak Anda telah menyelesaikan imunisasi dasar sesuai program Kemenkes RI.
                    </p>
                </div>
            </div>
        `;
  }

  // Render Full Content
  div.innerHTML = `
        <div style="max-width:800px; margin:0 auto; text-align:left;" id="kmsContent">
            <!-- Print/PDF Buttons - Hidden when printing -->
            <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding:1rem; background:var(--bg-elevated); border-radius:12px; border:1px solid var(--border);">
                <div>
                    <h4 style="margin:0 0 0.25rem 0; color:var(--primary);">
                        <i class="fas fa-file-medical"></i> Data Kesehatan Anak
                    </h4>
                    <p style="margin:0; color:var(--text-muted); font-size:0.85rem;">Cetak atau simpan sebagai PDF untuk arsip pribadi</p>
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button onclick="window.printKMS()" class="btn btn-primary btn-sm">
                        <i class="fas fa-print"></i> Cetak/PDF
                    </button>
                </div>
            </div>
            
            <!-- Print Header - Only visible when printing -->
            <div class="print-only" style="display:none; text-align:center; margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:3px solid var(--primary);">
                <h1 style="margin:0 0 0.5rem 0; color:var(--primary); font-family:'Outfit';">
                    <i class="fas fa-baby-carriage"></i> KARTU MENUJU SEHAT (KMS)
                </h1>
                <h3 style="margin:0 0 0.25rem 0; color:var(--text-secondary);">E-KMS Posyandu Digital</h3>
                <p style="margin:0; color:var(--text-muted); font-size:0.9rem;">
                    Dicetak: ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
            </div>
            
            <!-- Child Info Card -->
            <div class="card" style="background:var(--primary-gradient); color:white; border:none;">
                <div style="display:flex; align-items:center; gap:1.5rem;">
                    <div class="user-avatar" style="width:70px; height:70px; font-size:2rem; background:rgba(255,255,255,0.3); box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                        ${child.nama.charAt(0).toUpperCase()}
                    </div>
                    <div style="flex:1;">
                        <h3 style="margin:0; font-size:1.5rem; font-weight:800;">${child.nama}</h3>
                        <p style="margin:0.5rem 0 0 0; opacity:0.95; font-size:0.95rem;">
                            <i class="fas fa-venus-mars"></i> ${child.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} · 
                            <i class="fas fa-birthday-cake"></i> ${ageText}
                        </p>
                        <p style="margin:0.25rem 0 0 0; opacity:0.9; font-size:0.9rem;">
                            <i class="fas fa-female"></i> Ibu: ${child.nama_ibu}
                        </p>
                    </div>
                </div>
                ${
                  latestWeight
                    ? `
                <div style="margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid rgba(255,255,255,0.3); display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem; text-align:center;">
                    <div>
                        <div style="font-size:0.75rem; opacity:0.9; margin-bottom:0.25rem;">Berat Terakhir</div>
                        <div style="font-size:1.5rem; font-weight:700;">${latestWeight.berat_badan} kg</div>
                    </div>
                    <div>
                        <div style="font-size:0.75rem; opacity:0.9; margin-bottom:0.25rem;">Tinggi</div>
                        <div style="font-size:1.5rem; font-weight:700;">${latestWeight.tinggi_badan || "-"} cm</div>
                    </div>
                    <div>
                        <div style="font-size:0.75rem; opacity:0.9; margin-bottom:0.25rem;">Status Gizi</div>
                        <div style="font-size:1.1rem; font-weight:700;">${latestWeight.status_gizi || "Normal"}</div>
                    </div>
                </div>
                `
                    : ""
                }
            </div>
            
            <!-- Growth Chart -->
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-chart-line"></i> Grafik Pertumbuhan (KMS)</h4>
                </div>
                <div style="height:300px; margin-top:1rem;">
                    <canvas id="publicChart"></canvas>
                </div>
                <div style="margin-top:1rem; padding:1rem; background:var(--info-light); border-radius:8px; border-left:4px solid var(--info);">
                    <p style="margin:0; font-size:0.85rem; color:var(--text-secondary);">
                        <strong><i class="fas fa-info-circle"></i> Keterangan:</strong> 
                        Grafik menunjukkan perkembangan berat badan anak dibandingkan dengan standar WHO. 
                        Titik hitam adalah data anak Anda, area hijau adalah rentang normal.
                    </p>
                </div>
            </div>
            
            ${scheduleHtml}
            ${imunisasiHtml}
            ${nextImunisasiHtml}
            ${vitaminHtml}
            ${perkembanganHtml}
            
            <!-- Footer -->
            <div style="margin-top:2rem; padding:1.5rem; background:var(--bg-elevated); border-radius:12px; text-align:center; border:1px solid var(--border-light);">
                <p style="margin:0 0 1rem 0; color:var(--text-muted); font-size:0.9rem;">
                    <i class="fas fa-shield-alt"></i> Data kesehatan anak Anda tersimpan dengan aman
                </p>
                <a href="#/login" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt"></i> Login untuk Akses Lengkap
                </a>
            </div>
        </div>
    `;

  // Init Chart
  setTimeout(() => {
    const ctx = document.getElementById("publicChart").getContext("2d");
    const gender = child.jenis_kelamin === "P" ? "P" : "L";

    new Chart(ctx, {
      type: "line",
      data: {
        labels: [0, 6, 12, 24, 36, 48, 60],
        datasets: [
          {
            label: "Anak Ini",
            data: history.map((h) => ({
              x: Number(h.usia_bulan || 0),
              y: h.berat_badan,
            })),
            borderColor: "#009b77",
            backgroundColor: "#009b77",
            borderWidth: 3,
            tension: 0.3,
            pointBackgroundColor: "#009b77",
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: "SD+3",
            data: getCurveData(gender, 4),
            borderColor: "transparent",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            fill: "+1",
            pointRadius: 0,
            tension: 0.4,
          },
          {
            label: "SD+2",
            data: getCurveData(gender, 3),
            borderColor: "transparent",
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            fill: "+1",
            pointRadius: 0,
            tension: 0.4,
          },
          {
            label: "Median",
            data: getCurveData(gender, 2),
            borderColor: "rgba(16, 185, 129, 0.5)",
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            fill: "+1",
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5],
          },
          {
            label: "SD-2",
            data: getCurveData(gender, 1),
            borderColor: "transparent",
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            fill: "+1",
            pointRadius: 0,
            tension: 0.4,
          },
          {
            label: "SD-3",
            data: getCurveData(gender, 0),
            borderColor: "transparent",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            fill: "origin",
            pointRadius: 0,
            tension: 0.4,
          },
          {
            label: "Bawah",
            data: getCurveData(gender, 0).map((d) => ({ x: d.x, y: 0 })),
            borderColor: "transparent",
            backgroundColor: "rgba(239, 68, 68, 0.05)",
            fill: "-1",
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "linear",
            min: 0,
            max: 60,
            title: {
              display: true,
              text: "Usia (Bulan)",
              font: { weight: "bold", size: 12 },
            },
            grid: { color: "rgba(0,0,0,0.05)" },
          },
          y: {
            min: 0,
            title: {
              display: true,
              text: "Berat Badan (kg)",
              font: { weight: "bold", size: 12 },
            },
            grid: { color: "rgba(0,0,0,0.05)" },
          },
        },
        plugins: {
          legend: {
            labels: {
              filter: (item) =>
                item.text === "Anak Ini" || item.text === "Median",
              font: { size: 12, weight: "bold" },
              padding: 15,
            },
          },
          tooltip: {
            filter: (item) => item.datasetIndex === 0,
            callbacks: {
              label: function (context) {
                return `Berat: ${context.parsed.y} kg (${context.parsed.x} bulan)`;
              },
            },
          },
        },
      },
    });
  }, 100);
};

// --- PANDUAN APLIKASI ---
window.render_panduan = () => {
  const content = document.getElementById("page-content");
  const user = Auth.getUser();
  const role = user.role;

  let guideContent = "";

  if (role === "admin") {
    guideContent = `
            <div class="card">
                <div class="card-header"><h3 class="card-title">Panduan Administrator</h3></div>
                <div style="line-height: 1.6; color: var(--text-color);">
                    <p>Selamat datang di panel Admin E-KMS. Berikut adalah panduan pengelolaan sistem:</p>
                    
                    <h4 style="margin-top:1.5rem; color:var(--primary);">1. Manajemen Pengguna (User Management)</h4>
                    <p>Menu ini digunakan untuk menambah, mengedit, atau menghapus akun pengguna aplikasi.</p>
                    <ul>
                        <li><strong>Tambah User:</strong> Klik tombol "Tambah User", isi Nama, Username, Password, dan pilih Role (Admin/Kader/Orangtua).</li>
                        <li><strong>Edit User:</strong> Klik ikon pensil pada daftar user untuk mengubah data. Kosongkan password jika tidak ingin mengubahnya.</li>
                        <li><strong>Hapus User:</strong> Klik ikon sampah untuk menghapus user. <em>Note: Admin utama tidak bisa dihapus.</em></li>
                    </ul>

                    <h4 style="margin-top:1.5rem; color:var(--primary);">2. Activity Log (Log Aktivitas)</h4>
                    <p>Fitur ini merekam seluruh aktivitas penting dalam sistem untuk audit keamanan.</p>
                    <ul>
                        <li>Anda dapat melihat siapa melakukan apa dan kapan.</li>
                        <li>Gunakan kolom pencarian untuk memfilter log berdasarkan username atau aktivitas.</li>
                    </ul>

                    <h4 style="margin-top:1.5rem; color:var(--primary);">3. Pengaturan Sistem</h4>
                    <p>Menu ini untuk mengatur profil Posyandu yang akan tampil di laporan.</p>
                    <ul>
                        <li>Isi Nama Posyandu, Alamat, dan Kota/Kabupaten.</li>
                        <li>Data ini akan muncul pada kop surat saat mencetak laporan atau kartu KMS.</li>
                    </ul>
                </div>
            </div>
        `;
  } else {
    // PANDUAN KADER
    guideContent = `
            <div class="grid-stack grid-cols-2">
                <div class="card">
                    <div class="card-header"><h3 class="card-title">1. Manajemen Data Anak</h3></div>
                    <p>Masuk ke menu <strong>Data Anak</strong> untuk mengelola data balita.</p>
                    <ul>
                        <li><strong>Tambah Baru:</strong> Klik tombol "Tambah Anak", isi NIK, Nama, Tgl Lahir, dll secarta lengkap.</li>
                        <li><strong>Detail KMS:</strong> Klik tombol "Lihat KMS" untuk membuka halaman pencatatan lengkap.</li>
                        <li><strong>Edit:</strong> Gunakan menu edit untuk memperbaiki kesalahan data identitas.</li>
                    </ul>
                </div>

                <div class="card">
                    <div class="card-header"><h3 class="card-title">2. Input Penimbangan (KMS)</h3></div>
                    <p>Di halaman <strong>Detail Anak</strong> tab <strong>Pertumbuhan</strong>:</p>
                    <ul>
                        <li>Masukkan Tanggal Ukur, Berat Badan (kg), Tinggi (cm), dan Lingkar Kepala.</li>
                        <li>Centang <strong>ASI Eksklusif</strong> jika bayi masih ASI saja.</li>
                        <li>Centang <strong>PMT</strong> jika anak mendapat Pemberian Makanan Tambahan.</li>
                        <li>Grafik pertumbuhan akan otomatis terupdate setelah simpan.</li>
                    </ul>
                </div>

                <div class="card">
                    <div class="card-header"><h3 class="card-title">3. Imunisasi & Obat</h3></div>
                    <p>Di halaman <strong>Detail Anak</strong> tab <strong>Imunisasi & Obat</strong>:</p>
                    <ul>
                        <li><strong>Imunisasi:</strong> Pilih jenis vaksin (BCG, Polio, dll) dan tanggal pemberian.</li>
                        <li><strong>Vitamin A:</strong> Rekap pemberian Vitamin A terlihat disini (input via menu Vitamin A).</li>
                        <li><strong>Obat Cacing:</strong> Catat pemberian obat cacing berkala setiap 6 bulan.</li>
                    </ul>
                </div>

                <div class="card">
                    <div class="card-header"><h3 class="card-title">4. Pemantauan Perkembangan (SDIDTK)</h3></div>
                    <p>Gunakan tab <strong>Perkembangan</strong> untuk mencatat hasil KPSP:</p>
                    <ul>
                        <li>Pilih Tanggal Periksa.</li>
                        <li>Tentukan hasil: <strong>Sesuai</strong>, <strong>Meragukan</strong>, atau <strong>Penyimpangan</strong>.</li>
                        <li>Isi detail capaian motorik, bicara, dan sosialisasi.</li>
                        <li>Catat intervensi jika ditemukan penyimpangan.</li>
                    </ul>
                </div>

                <div class="card">
                    <div class="card-header"><h3 class="card-title">5. Distribusi Vitamin A</h3></div>
                    <p>Masuk ke menu <strong>Vitamin A</strong> (Bulan Februari & Agustus):</p>
                    <ul>
                        <li>Gunakan formulir untuk mencatat pemberian massal.</li>
                        <li>Pilih Nama Anak (ketik untuk mencari).</li>
                        <li>Pilih jenis kapsul: <strong>Biru</strong> (6-11 bln) atau <strong>Merah</strong> (12-59 bln).</li>
                    </ul>
                </div>

                <div class="card">
                    <div class="card-header"><h3 class="card-title">6. Laporan SKDN</h3></div>
                    <p>Menu <strong>Laporan SKDN</strong> menampilkan rekap bulanan:</p>
                    <ul>
                        <li><strong>S:</strong> Jumlah seluruh balita.</li>
                        <li><strong>K:</strong> Balita punya KMS (terdaftar).</li>
                        <li><strong>D:</strong> Balita yang ditimbang bulan ini.</li>
                        <li><strong>N:</strong> Balita yang berat badannya naik.</li>
                        <li>Gunakan tombol <strong>Cetak</strong> untuk mengunduh laporan fisik.</li>
                    </ul>
                </div>
            </div>
        `;
  }

  content.innerHTML = `
        <div style="margin-bottom:1.5rem;">
            <h2 style="font-family:'Outfit'; font-weight:700; color:var(--primary);">Panduan Penggunaan E-KMS</h2>
            <p style="color:var(--text-muted);">Dokumentasi lengkap untuk ${role === "admin" ? "Administrator Sistem" : "Kader Posyandu"}</p>
        </div>
        ${guideContent}
    `;
};
