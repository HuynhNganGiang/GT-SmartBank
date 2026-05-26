function getSavedUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

function getSavedToken() {
    return localStorage.getItem("token");
}

function removeSavedToken() {
    localStorage.removeItem("token");
}

function removeSavedCurrentUser() {
    localStorage.removeItem("user");
}

window.logout = function() {
    removeSavedToken();
    removeSavedCurrentUser();
    localStorage.removeItem("refreshToken");
    if (typeof window.showToast === "function") {
        window.showToast("Đăng xuất thành công", "success", 1500);
    }
    setTimeout(() => {
        window.location.href = "/bank-ui/pages/login.html";
    }, 1200);
};

// Kiểm tra bảo mật và chuyển hướng sớm
// Các trang công khai không cần đăng nhập
const _path = window.location.pathname;
const isPublicPage = _path.includes("login.html") ||
                     _path.includes("portal.html") ||
                     _path.includes("chinhanh.html") ||
                     _path.includes("chi-nhanh-atm.html") ||
                     _path.includes("index.html") ||
                     _path === "/" ||
                     _path === "" ||
                     _path.includes("ca-nhan.html") ||
                     _path.includes("doanh-nghiep.html") ||
                     _path.includes("dich-vu-so.html") ||
                     _path.includes("khuyen-mai.html") ||
                     _path.includes("ho-tro.html") ||
                     _path.includes("tiet-kiem-online.html") ||
                     _path.includes("chuyen-tien-247.html") ||
                     _path.includes("the-tin-dung.html") ||
                     _path.includes("vay-tieu-dung.html");
const currentUser = getSavedUser();

if (!isPublicPage && !currentUser) {
    const isLocal = _path.includes("/");
    window.location.href = isLocal ? "/pages/login.html" : "/pages/login.html";
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    if (isDark) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }

    // Nếu đang ở trang dashboard có biểu đồ, load lại dữ liệu để vẽ lại biểu đồ với màu tương ứng theo theme mới
    if (typeof loadDashboardData === "function") {
        loadDashboardData();
    }
}

// Chạy sớm nhất có thể để tránh chớp nháy trắng khi chuyển trang
(function() {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        document.body.classList.add("dark");
    }
})();

// Inject keyframe progress bar cho Toast Notification động và CSS bổ trợ cho Collapsible Sidebar
if (!document.getElementById("toast-keyframe-style")) {
    const style = document.createElement("style");
    style.id = "toast-keyframe-style";
    style.innerHTML = `
        @keyframes toastProgress {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
        }
        @media (min-width: 1024px) {
            #sidebar.collapsed {
                width: 5rem !important;
            }
            #sidebar.collapsed .brand-text,
            #sidebar.collapsed .nav-text,
            #sidebar.collapsed h2,
            #sidebar.collapsed p {
                display: none !important;
            }
            #sidebar.collapsed .brand {
                padding: 1.5rem 0.5rem !important;
                justify-content: center !important;
            }
            #sidebar.collapsed nav {
                padding: 1rem 0.5rem !important;
                align-items: center !important;
            }
            #sidebar.collapsed nav a {
                padding: 0.75rem !important;
                justify-content: center !important;
                width: 3.25rem !important;
                height: 3.25rem !important;
            }
            #sidebar.collapsed .sidebar-footer {
                padding: 1rem 0.5rem !important;
            }
            #sidebar.collapsed .sidebar-footer a,
            #sidebar.collapsed .sidebar-footer button {
                padding: 0.75rem !important;
                justify-content: center !important;
                width: 3.25rem !important;
                height: 3.25rem !important;
            }
            #sidebar.collapsed #collapseBtnIcon {
                transform: rotate(180deg) !important;
            }
            .main-content.expanded {
                margin-left: 5rem !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Định nghĩa core Toast API dùng chung cho toàn bộ website
window.showToast = function(message, type = 'info', duration = 4000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type} pointer-events-auto flex items-stretch gap-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden translate-x-full transition-transform duration-300 opacity-0`;
    
    let iconSvg = '';
    let iconBg = '';
    if (type === 'success') {
        iconBg = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
        iconSvg = `<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
    } else if (type === 'error') {
        iconBg = 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400';
        iconSvg = `<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
    } else if (type === 'warning') {
        iconBg = 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400';
        iconSvg = `<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
    } else {
        iconBg = 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400';
        iconSvg = `<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
    }
    
    let title = 'Thông báo';
    if (type === 'success') title = 'Thành công';
    else if (type === 'error') title = 'Lỗi';
    else if (type === 'warning') title = 'Cảnh báo';
    
    toast.innerHTML = `
        <div class="flex items-center justify-center px-4 ${iconBg}">${iconSvg}</div>
        <div class="flex-1 p-4 flex flex-col gap-0.5 justify-center">
            <div class="font-bold text-sm text-slate-800 dark:text-white leading-none">${title}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mt-1">${message}</div>
        </div>
        <button class="px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <div class="absolute bottom-0 left-0 right-0 h-1 ${type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'}" style="animation: toastProgress ${duration}ms linear forwards; transform-origin: left;"></div>
    `;
    
    container.appendChild(toast);
    
    // Kích hoạt animation trượt
    toast.offsetHeight;
    toast.classList.remove('translate-x-full', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
};

// Hàm xử lý thu gọn/mở rộng Sidebar cho Desktop
window.toggleSidebarCollapse = function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        if (mainContent) {
            mainContent.classList.toggle('expanded');
        }
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem("sidebar-collapsed", isCollapsed ? "true" : "false");
    }
};

// Đồng bộ giao diện Sidebar & Topbar Glassmorphism
document.addEventListener("DOMContentLoaded", () => {
    if (isLoginPage) return; // Không can thiệp trang login

    const path = window.location.pathname;
    const isIndexActive = (path.endsWith("admin/dashboard.html") || path.includes("admin/dashboard.html"));
    
    function isActive(linkPath) {
        return path.includes(linkPath);
    }

    // 1. Tự động chèn Mobile Drawer Overlay nếu chưa có
    if (!document.getElementById("sidebarOverlay")) {
        const overlay = document.createElement("div");
        overlay.id = "sidebarOverlay";
        overlay.className = "sidebar-overlay fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 lg:hidden";
        overlay.onclick = toggleSidebar;
        document.body.appendChild(overlay);
    }

    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar && overlay) {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('opacity-0');
            overlay.classList.toggle('pointer-events-none');
        }
    };

    // 2. Tìm và đồng bộ Sidebar
    const sidebarEl = document.querySelector("aside.sidebar");
    if (sidebarEl) {
        sidebarEl.id = "sidebar";
        // Dùng bg gradient đỏ sậm thương hiệu GT SmartBank
        sidebarEl.className = "sidebar fixed lg:static inset-y-0 left-0 z-30 flex flex-col justify-between w-64 md:w-72 transition-all duration-300 transform -translate-x-full lg:translate-x-0";
        sidebarEl.style.cssText = "background: linear-gradient(185deg, #b60000 0%, #700000 100%); color: white; border-right: 1px solid rgba(255,255,255,0.07); box-shadow: 4px 0 30px rgba(0,0,0,0.25);";
        sidebarEl.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;justify-content:space-between;">
                <div>
                    <!-- Brand Section -->
                    <div class="brand-text" style="display:flex;align-items:center;gap:12px;padding:24px;border-bottom:1px solid rgba(255,255,255,0.08);">
                        <div style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.12);color:#f7b500;flex-shrink:0;border:1px solid rgba(255,255,255,0.1);">
                            <svg viewBox="0 0 100 100" style="width:26px;height:26px;">
                                <path d="M50 12 L82 22 V48 C82 66 69 82 50 88 C31 82 18 66 18 48 V22 Z" fill="#ffffff" />
                                <path d="M50 20 L74 27 V48 C74 61 64 73 50 78 C36 73 26 61 26 48 V27 Z" fill="#f7b500" opacity="0.9" />
                                <path d="M43 38 H57 C60 38 62 40 62 43 V46 H52 V43 H44 V55 H57 V52 H62 V55 C62 58 60 60 57 60 H43 C40 60 38 58 38 55 V43 C38 40 40 38 43 38 Z" fill="#ffffff" />
                                <path d="M47 43 H53 V46 H50.5 V55 H49.5 V46 H47 Z" fill="#b60000" />
                            </svg>
                        </div>
                        <div>
                            <div style="font-size:17px;font-weight:800;color:white;letter-spacing:0.3px;line-height:1.1;">GT SmartBank</div>
                            <div style="font-size:10px;font-weight:700;color:#f7b500;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">Smart Digital Banking</div>
                        </div>
                    </div>

                    <!-- Navigation Menu -->
                    <nav style="display:flex;flex-direction:column;gap:4px;padding:16px 12px;">
                        <a href="/bank-ui/admin/dashboard.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isIndexActive ? 'background:#ffffff;color:#b60000;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:rgba(255,255,255,0.7);'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Tổng quan">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                            <span class="nav-text">Tổng quan</span>
                        </a>
                        <a href="/pages/khachhang.html" id="navCustomers" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('khachhang.html') ? 'background:#ffffff;color:#b60000;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:rgba(255,255,255,0.7);'}${currentUser.role !== 'Admin' ? 'display:none;' : ''}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Khách hàng">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            <span class="nav-text">Khách hàng</span>
                        </a>
                        <a href="/pages/taikhoan.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('taikhoan.html') ? 'background:#ffffff;color:#b60000;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:rgba(255,255,255,0.7);'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Tài khoản">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                            <span class="nav-text">Tài khoản</span>
                        </a>
                        <a href="/pages/chuyentien.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('chuyentien.html') ? 'background:#ffffff;color:#b60000;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:rgba(255,255,255,0.7);'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Chuyển tiền">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/></svg>
                            <span class="nav-text">Chuyển tiền</span>
                        </a>
                        <a href="/pages/giaodich.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('giaodich.html') ? 'background:#ffffff;color:#b60000;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:rgba(255,255,255,0.7);'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Giao dịch">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            <span class="nav-text">Giao dịch</span>
                        </a>
                        <a href="/pages/sotietkiem.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('sotietkiem.html') ? 'background:#ffffff;color:#b60000;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:rgba(255,255,255,0.7);'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Sổ tiết kiệm">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                            <span class="nav-text">Sổ tiết kiệm</span>
                        </a>
                        <a href="/pages/chi-nhanh-atm.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('chi-nhanh-atm.html') ? 'background:#ffffff;color:#b60000;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:rgba(255,255,255,0.7);'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Chi nhánh & ATM">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
                            <span class="nav-text">Chi nhánh & ATM</span>
                        </a>
                        <a href="/swagger/index.html" target="_blank" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;color:rgba(255,255,255,0.7);" onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.color='white';" onmouseout="this.style.background='';this.style.color='rgba(255,255,255,0.7)';" data-tooltip="Swagger API">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/></svg>
                            <span class="nav-text">Swagger API</span>
                        </a>
                    </nav>
                </div>

                <div style="padding:16px 12px;border-top:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;gap:8px;">
                    <a href="#" onclick="logout()" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none;color:rgba(248,113,113,0.9);transition:all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.15)';this.style.color='#fca5a5';" onmouseout="this.style.background='';this.style.color='rgba(248,113,113,0.9)';">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                        <span class="nav-text">Đăng xuất</span>
                    </a>
                    <button id="sidebarCollapseBtn" onclick="toggleSidebarCollapse()" title="Thu gọn sidebar" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;border:none;cursor:pointer;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);width:100%;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.14)';this.style.color='white';" onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.7)';">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;transition:transform 0.3s;" id="collapseBtnIcon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                        <span class="nav-text">Thu gọn</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Khôi phục trạng thái thu gọn/mở rộng Sidebar từ localStorage
    const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    if (isCollapsed && sidebar) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('expanded');
        }
    }

    // 3. Tìm và đồng bộ Topbar
    const topbarEl = document.querySelector(".topbar");
    if (topbarEl) {
        const h1Text = topbarEl.querySelector("h1")?.innerText || "Hệ thống Ngân hàng điện tử";
        const pText = topbarEl.querySelector("p")?.innerText || "Dịch vụ tài chính thế hệ mới GT Smart Bank";
        const titleHtml = `
            <h1 class="text-base md:text-xl font-bold text-slate-800 dark:text-white leading-tight" id="dashboardTitle">${h1Text}</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium hidden md:block">${pText}</p>
        `;

        const userFullName = currentUser.hoTen;
        const userRole = currentUser.role === "Admin" ? "Quản trị viên" : "Khách hàng";

        topbarEl.className = "topbar flex items-center justify-between p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 w-full";
        
        topbarEl.innerHTML = `
            <div class="flex items-center gap-4">
                <button class="menu-toggle p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 lg:hidden" id="menuToggle" onclick="toggleSidebar()">
                    <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                </button>
                <div class="topbar-title">
                    ${titleHtml}
                </div>
            </div>

            <div class="topbar-actions flex items-center gap-4">
                <div class="user-welcome hidden sm:flex items-center gap-3">
                    <div class="user-info text-right">
                        <div class="name font-bold text-sm text-slate-800 dark:text-slate-100" id="userFullName">${userFullName}</div>
                        <div class="role text-xs text-slate-500 dark:text-slate-450 font-bold" id="userRole">${userRole}</div>
                    </div>
                </div>

                <button onclick="toggleDarkMode()" class="theme-btn flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all" id="themeBtn">
                    <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current"><path d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z"/></svg>
                    <span class="theme-text">Tối màu</span>
                </button>
            </div>
        `;
    }
    
    // Initialize global animations
    setupGlobalAnimations();
});

// =========================================================================
// HỆ THỐNG XỬ LÝ LỖI TOÀN CỤC CHUYÊN NGHIỆP (GLOBAL ERROR HANDLERS)
// Bẫy toàn bộ các lỗi phát sinh ngoài ý muốn và làm sạch lỗi code kỹ thuật
// =========================================================================

// 1. Bẫy lỗi runtime chưa được bắt (Unhandled runtime script exceptions)
window.addEventListener("error", function(event) {
    // Không bẫy lỗi tải tài nguyên như hình ảnh, file script, style bị lỗi 404
    if (event.target && (event.target.src || event.target.href)) {
        console.warn("Lỗi tải tài nguyên hệ thống:", event.target.src || event.target.href);
        return;
    }
    
    console.error("Bắt được lỗi runtime toàn cục:", event.error || event.message);
    
    let message = "Đã xảy ra sự cố xử lý giao diện hệ thống. Vui lòng tải lại trang.";
    if (event.error && event.error.message) {
        message = event.error.message;
    } else if (event.message) {
        message = event.message;
    }
    
    // Sử dụng hàm làm sạch lỗi nếu tồn tại
    if (typeof window.sanitizeErrorMessage === "function") {
        message = window.sanitizeErrorMessage(message);
    }
    
    if (typeof window.showToast === "function") {
        window.showToast(message, "error", 5000);
    }
});

// 2. Bẫy lỗi Promise bị từ chối mà không được xử lý (Unhandled Promise Rejections)
window.addEventListener("unhandledrejection", function(event) {
    console.error("Bắt được lỗi Promise không được bắt toàn cục:", event.reason);
    
    const reason = event.reason;
    let message = "Yêu cầu gặp sự cố khi xử lý dữ liệu. Vui lòng thử lại.";
    
    if (reason) {
        if (reason instanceof Error) {
            message = reason.message;
        } else if (typeof reason === "string") {
            message = reason;
        } else if (reason.message) {
            message = reason.message;
        }
    }
    
    // Sử dụng hàm làm sạch lỗi để loại bỏ các lỗi code kỹ thuật
    if (typeof window.sanitizeErrorMessage === "function") {
        message = window.sanitizeErrorMessage(message);
    }
    
    if (typeof window.showToast === "function") {
        window.showToast(message, "error", 5000);
    }
});

// Global Animations initialization
function setupGlobalAnimations() {
    // Add page-fade-in to body
    document.body.classList.add("page-fade-in");

    // Ripple effect handler for buttons
    document.addEventListener("click", function(e) {
        const button = e.target.closest("button, .btn-ripple, input[type='submit'], .service-card, a.px-8, .action-card, .theme-btn");
        if (!button) return;

        // Skip normal text links
        if (button.tagName === 'A' && !button.classList.contains('px-8') && !button.classList.contains('service-card') && !button.classList.contains('action-card') && !button.classList.contains('theme-btn')) {
            return;
        }

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x - size / 2}px`;
        ripple.style.top = `${y - size / 2}px`;

        const style = window.getComputedStyle(button);
        const bgColor = style.backgroundColor;

        let isLight = true;
        const match = bgColor.match(/\d+/g);
        if (match && match.length >= 3) {
            const r = parseInt(match[0]);
            const g = parseInt(match[1]);
            const b = parseInt(match[2]);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            isLight = brightness > 180;
        }

        ripple.className = isLight ? "ripple-dark" : "ripple";

        const oldRipples = button.querySelectorAll(".ripple, .ripple-dark");
        oldRipples.forEach(r => r.remove());

        const originalPosition = style.position;
        if (originalPosition === 'static' || !originalPosition) {
            button.style.position = 'relative';
        }
        button.style.overflow = 'hidden';

        button.appendChild(ripple);
    });

    // Auto-Scroll Reveal observer
    autoInjectRevealClasses();

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: "0px 0px -30px 0px"
        });

        document.querySelectorAll(".reveal-on-scroll").forEach(el => {
            observer.observe(el);
        });
    } else {
        document.querySelectorAll(".reveal-on-scroll").forEach(el => {
            el.classList.add("revealed");
        });
    }
}

function autoInjectRevealClasses() {
    const targets = document.querySelectorAll(
        "main > section, " +
        "body > section:not(.hero-gradient), " +
        ".grid > .bg-white, " +
        ".stat-card-shadow, " +
        ".service-card, " +
        ".action-card"
    );

    targets.forEach((el) => {
        if (el.classList.contains("hero-gradient") || el.closest("header") || el.closest("footer")) return;
        el.classList.add("reveal-on-scroll");
    });
}

// Tự động nạp Trợ lý ảo AI Assistant nổi
(function() {
    if (!document.getElementById("ai-assistant-script")) {
        const script = document.createElement("script");
        script.id = "ai-assistant-script";
        script.src = "/js/ai-assistant.js";
        script.async = true;
        document.head.appendChild(script);
    }
})();