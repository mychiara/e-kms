const Router = {
  routes: {
    login: "login",
    dashboard: "dashboard",
    anak_list: "anak_list",
    anak_form: "anak_form",
    anak_detail: "anak_detail",
    alerts: "alerts",
    jadwal: "jadwal",
    jadwal_form: "jadwal_form",
    pengumuman: "pengumuman",
    pengumuman_form: "pengumuman_form",
    laporan: "laporan",
    users: "users",
    user_form: "user_form",
    posyandu_list: "posyandu_list",
    posyandu_form: "posyandu_form",
    activity_logs: "activity_logs",
    pengaturan: "pengaturan",
    cek_kms: "cek_kms",
    panduan: "panduan", // Route Panduan
  },

  async init() {
    window.addEventListener("hashchange", () => this.handleRoute());
    this.handleRoute();
  },

  async handleRoute() {
    let hash = window.location.hash.replace("#/", "") || "dashboard";
    const [page, id] = hash.split("?id="); // Very simple param handling

    if (page !== "cek_kms" && !Auth.isLoggedIn()) {
      this.render("login");
      return;
    }

    if (this.routes[page]) {
      this.render(page, id);
    } else {
      console.error("Route not found:", page);
      this.render("dashboard");
    }
  },

  render(page, id = null) {
    const app = document.getElementById("app");

    if (page === "login") {
      app.innerHTML = this.getLayout("auth", page);
    } else if (page === "cek_kms") {
      app.innerHTML = this.getLayout("public", page);
    } else {
      app.innerHTML = this.getLayout("main", page);
    }

    // Initialize view-specific logic
    if (typeof window[`render_${page}`] === "function") {
      window[`render_${page}`](id);
    }
  },

  getLayout(type, page) {
    if (type === "auth") {
      return `<div class="auth-container" id="page-content"></div>`;
    }

    if (type === "public") {
      return `
        <main class="main-content" style="margin-left:0">
            <div class="content-wrapper" id="page-content"></div>
            <footer class="main-footer">
                &copy; ${new Date().getFullYear()} Copyright by <a href="https://Masandigital.com" target="_blank">Masandigital.com</a>
            </footer>
        </main>`;
    }

    const user = Auth.getUser();
    const role = user.role;

    // Format page title properly
    const pageTitle = page
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    return `
        <div class="app-container">
            <aside class="sidebar">
                <div class="sidebar-brand">
                    <div class="sidebar-icon"><i class="fas fa-hand-holding-medical"></i></div>
                    <div class="brand-text">E-KMS<br><span style="font-size: 0.8rem; opacity: 0.7; letter-spacing: 1px;">PORTAL</span></div>
                </div>
                
                <ul class="nav-menu">
                    <li class="nav-label">Utama</li>
                    <li><a href="#/dashboard" class="nav-item ${page == "dashboard" ? "active" : ""}"><i class="fas fa-chart-pie"></i> Dashboard</a></li>
                    <li><a href="#/cek_kms" class="nav-item"><i class="fas fa-qrcode"></i> Cek KMS Publik</a></li>
                    
                    <li class="nav-label">Data Balita</li>
                    <li><a href="#/anak_list" class="nav-item ${page == "anak_list" ? "active" : ""}"><i class="fas fa-baby"></i> Daftar Anak</a></li>
                    <li><a href="#/alerts" class="nav-item ${page == "alerts" ? "active" : ""}"><i class="fas fa-bell"></i> Notifikasi</a></li>
                    
                    <li class="nav-label">Layanan</li>
                    <li><a href="#/jadwal" class="nav-item ${page == "jadwal" ? "active" : ""}"><i class="fas fa-calendar-check"></i> Jadwal Kegiatan</a></li>
                    <li><a href="#/pengumuman" class="nav-item ${page == "pengumuman" ? "active" : ""}"><i class="fas fa-bullhorn"></i> Pengumuman</a></li>

                    ${
                      role == "admin"
                        ? `
                    <li class="nav-label">Sistem</li>
                    <li><a href="#/users" class="nav-item ${page == "users" ? "active" : ""}"><i class="fas fa-user-shield"></i> Kelola User</a></li>
                    <li><a href="#/posyandu_list" class="nav-item ${page == "posyandu_list" ? "active" : ""}"><i class="fas fa-map-location-dot"></i> Kelola Wilayah</a></li>
                    <li><a href="#/activity_logs" class="nav-item ${page == "activity_logs" ? "active" : ""}"><i class="fas fa-fingerprint"></i> Log Aktivitas</a></li>
                    `
                        : ""
                    }
                </ul>
                
                <div style="margin-top: auto; padding-top: 1.5rem; border-top: 1px solid #f1f5f9;">
                    <a href="javascript:Auth.logout()" class="nav-item" style="color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2;">
                        <i class="fas fa-power-off"></i> Logout
                    </a>
                </div>
            </aside>
            
            <main class="main-content">
                <header class="top-header">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <button class="mobile-toggle btn btn-outline btn-sm" onclick="document.querySelector('.sidebar').classList.toggle('active')" style="padding: 0.5rem; width: 40px; height: 40px; display: none;">
                            <i class="fas fa-bars"></i>
                        </button>
                        <div class="page-title">${pageTitle}</div>
                    </div>
                    
                    <div class="user-profile">
                        <div style="text-align: right; line-height: 1.2;">
                            <div class="user-name">${user.name}</div>
                            <div style="font-size: 0.7rem; color: var(--txt-muted); font-weight: 700; text-transform: uppercase;">
                                ${role}${user.posyandu ? ` &bull; ${user.posyandu}` : role === "admin" ? " &bull; Global" : ""}
                            </div>
                        </div>
                        <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                    </div>
                </header>
                
                <div class="content-wrapper" id="page-content"></div>
                
                <footer class="main-footer" style="background: #fff; border-top: 1px solid #f1f5f9; padding: 2.5rem; text-align: center; margin-top: 2rem; border-radius: 24px 24px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,0.02);">
                    <div style="color: var(--txt-main); font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem;">
                        &copy; ${new Date().getFullYear()} <span style="background: linear-gradient(135deg, var(--accent) 0%, #0ea5e9 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;">Masandigital.com</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--txt-muted); font-weight: 500; letter-spacing: 0.5px;">E-KMS Portal v3.0 &bull; Monitoring Kesehatan Balita Digital &bull; All Rights Reserved</div>
                </footer>
            </main>
        </div>
        <style>
            @media (max-width: 1024px) {
                .mobile-toggle { display: flex !important; }
            }
        </style>
        `;
  },
};
