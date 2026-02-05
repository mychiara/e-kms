const Router = {
    routes: {
        'login': 'login',
        'dashboard': 'dashboard',
        'anak_list': 'anak_list',
        'anak_form': 'anak_form',
        'anak_detail': 'anak_detail',
        'alerts': 'alerts',
        'vitamin': 'vitamin',
        'vitamin_form': 'vitamin_form',
        'jadwal': 'jadwal',
        'jadwal_form': 'jadwal_form',
        'laporan': 'laporan',
        'users': 'users',
        'user_form': 'user_form',
        'activity_logs': 'activity_logs',
        'pengaturan': 'pengaturan',
        'cek_kms': 'cek_kms',
        'panduan': 'panduan' // Route Panduan
    },

    async init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    async handleRoute() {
        let hash = window.location.hash.replace('#/', '') || 'dashboard';
        const [page, id] = hash.split('?id='); // Very simple param handling
        
        if (page !== 'cek_kms' && !Auth.isLoggedIn()) {
            this.render('login');
            return;
        }

        if (this.routes[page]) {
            this.render(page, id);
        } else {
            console.error('Route not found:', page);
            this.render('dashboard');
        }
    },

    render(page, id = null) {
        const app = document.getElementById('app');
        
        if (page === 'login') {
            app.innerHTML = this.getLayout('auth', page);
        } else if (page === 'cek_kms') {
            app.innerHTML = this.getLayout('public', page);
        } else {
            app.innerHTML = this.getLayout('main', page);
        }

        // Initialize view-specific logic
        if (typeof window[`render_${page}`] === 'function') {
            window[`render_${page}`](id);
        }
    },

    getLayout(type, page) {
        if (type === 'auth') {
            return `<div class="auth-container" id="page-content"></div>`;
        }
        if (type === 'public') {
            return `<main class="main-content" style="margin-left:0"><div class="content-wrapper" id="page-content"></div></main>`;
        }
        
        const user = Auth.getUser();
        const role = user.role;
        
        // Format page title properly
        const pageTitle = page
            .replace('_', ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        
        return `
        <div class="app-container">
            <aside class="sidebar">
                <div class="sidebar-brand">
                    <div class="sidebar-icon"><i class="fas fa-baby-carriage"></i></div>
                    <div class="brand-text">E-KMS</div>
                </div>
                <ul class="nav-menu">
                    <li><a href="#/dashboard" class="nav-item ${page=='dashboard'?'active':''}"><i class="fas fa-th-large"></i> Dashboard</a></li>
                    <li><a href="#/cek_kms" class="nav-item"><i class="fas fa-search"></i> Cek KMS (Publik)</a></li>
                    
                    ${role != 'orangtua' ? `
                    <li class="nav-label">Data Balita</li>
                    <li><a href="#/anak_list" class="nav-item ${page=='anak_list'?'active':''}"><i class="fas fa-child"></i> Data Anak</a></li>
                    <li><a href="#/alerts" class="nav-item ${page=='alerts'?'active':''}"><i class="fas fa-bell"></i> Alert & Peringatan</a></li>
                    
                    <li class="nav-label">Kegiatan</li>
                    <li><a href="#/jadwal" class="nav-item ${page=='jadwal'?'active':''}"><i class="fas fa-calendar-alt"></i> Jadwal Posyandu</a></li>
                    <li><a href="#/vitamin" class="nav-item ${page=='vitamin'?'active':''}"><i class="fas fa-pills"></i> Vitamin A</a></li>
                    
                    <li class="nav-label">Laporan</li>
                    <li><a href="#/laporan" class="nav-item ${page=='laporan'?'active':''}"><i class="fas fa-file-alt"></i> Laporan SKDN</a></li>
                    ` : ''}

                    ${role == 'admin' ? `
                    <li class="nav-label">Admin</li>
                    <li><a href="#/users" class="nav-item ${page=='users'?'active':''}"><i class="fas fa-users"></i> Manajemen User</a></li>
                    <li><a href="#/activity_logs" class="nav-item ${page=='activity_logs'?'active':''}"><i class="fas fa-history"></i> Activity Log</a></li>
                    <li><a href="#/pengaturan" class="nav-item ${page=='pengaturan'?'active':''}"><i class="fas fa-cog"></i> Pengaturan</a></li>
                    ` : ''}

                    ${role != 'orangtua' ? `
                    <li class="nav-label">Bantuan</li>
                    <li><a href="#/panduan" class="nav-item ${page=='panduan'?'active':''}"><i class="fas fa-book-open"></i> Panduan Aplikasi</a></li>
                    ` : ''}
                </ul>
                <div style="margin-top: auto; padding-top: 2rem;">
                    <a href="javascript:Auth.logout()" class="nav-item" style="color: var(--danger);">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </aside>
            <main class="main-content">
                <header class="top-header">
                    <div class="header-left">
                        <button class="mobile-toggle" onclick="toggleSidebar()">
                            <i class="fas fa-bars"></i>
                        </button>
                        <div class="page-title">${pageTitle}</div>
                    </div>
                    <div class="user-profile">
                        <span class="user-name">Halo, ${user.name}</span>
                        <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                    </div>
                </header>
                <div class="content-wrapper" id="page-content"></div>
            </main>

        </div>
        `;
    }
};
