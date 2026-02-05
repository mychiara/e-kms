/**
 * E-KMS APPLICATION INITIALIZER
 * Enhanced with mobile interactions and smooth UX
 */

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
    initializeMobileMenu();
    initializeUIEnhancements();
});

/**
 * Mobile Menu Toggle Functionality
 */
function initializeMobileMenu() {
    // Create backdrop element if it doesn't exist
    if (!document.querySelector('.sidebar-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
        
        // Close sidebar when clicking backdrop
        backdrop.addEventListener('click', closeSidebar);
    }

    // Listen for route changes to close sidebar on mobile
    window.addEventListener('hashchange', () => {
        if (window.innerWidth <= 1024) {
            closeSidebar();
        }
    });
}

/**
 * Toggle Sidebar (Called from mobile toggle button)
 */
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');
    
    if (sidebar && backdrop) {
        sidebar.classList.toggle('active');
        backdrop.classList.toggle('active');
        
        // Prevent body scroll when sidebar is open
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
};

/**
 * Close Sidebar
 */
function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');
    
    if (sidebar && backdrop) {
        sidebar.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * UI Enhancements
 */
function initializeUIEnhancements() {
    // Smooth scroll for anchor links (not hash routes)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a[href^="#"]');
        if (target) {
            const href = target.getAttribute('href');
            // Ignore hash routes (e.g., #/dashboard) and empty hashes
            if (href && href !== '#' && !href.includes('/')) {
                e.preventDefault();
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    });

    // Add ripple effect to buttons
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.btn');
        if (button) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        }
    });

    // Add CSS for ripple animation if not exists
    if (!document.querySelector('#ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Auto-hide alerts after 5 seconds
    const autoHideAlerts = () => {
        document.querySelectorAll('.alert:not(.alert-persistent)').forEach(alert => {
            setTimeout(() => {
                alert.style.animation = 'slideInDown 0.3s ease-out reverse';
                setTimeout(() => alert.remove(), 300);
            }, 5000);
        });
    };
    
    // Run on initial load and after DOM mutations
    autoHideAlerts();
    const observer = new MutationObserver(autoHideAlerts);
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Show Loading Overlay
 */
window.showLoader = function() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'flex';
    }
};

/**
 * Hide Loading Overlay
 */
window.hideLoader = function() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
};

/**
 * Utility: Smooth Scroll to Top
 */
window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Export for use in other modules if needed
window.AppUtils = {
    toggleSidebar,
    closeSidebar,
    showLoader,
    hideLoader,
    scrollToTop
};
