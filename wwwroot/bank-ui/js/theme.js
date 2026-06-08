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
const isLoginPage = _path.includes("/pages/login.html");
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
const currentRole = (
    currentUser?.role ||
    currentUser?.Role ||
    currentUser?.vaiTro ||
    currentUser?.chucVu ||
    localStorage.getItem("role") ||
    ""
).toString().trim().toLowerCase();
if (!isPublicPage && !currentUser) {
    window.location.href = "/bank-ui/pages/login.html";
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
window.showSuccessModal = function(title, message) {
    const oldModal = document.getElementById("successModal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.id = "successModal";
    modal.className = "fixed inset-0 z-[12000] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm";

    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800 p-8 w-[90%] max-w-md text-center animate-[fadeUp_0.3s_ease]">
            <div class="mx-auto mb-4 w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg viewBox="0 0 24 24" class="w-11 h-11 fill-current">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>

            <h2 class="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">${title}</h2>
            <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mb-6">${message}</p>

            <button onclick="document.getElementById('successModal').remove()"
                class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all">
                Hoàn tất
            </button>
        </div>
    `;

    document.body.appendChild(modal);
};
window.showReceiptModal = function(data) {
    const oldModal = document.getElementById("receiptModal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.id = "receiptModal";
    modal.className = "fixed inset-0 z-[13000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm";

    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-7 w-[92%] max-w-md animate-[fadeUp_0.3s_ease]">
            <div class="text-center mb-5">
                <div class="mx-auto mb-3 w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <svg viewBox="0 0 24 24" class="w-9 h-9 fill-current">
                        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                </div>
                <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">BIÊN LAI GIAO DỊCH</h2>
                <p class="text-xs font-bold text-slate-400 mt-1">GT SmartBank Digital Banking</p>
            </div>

            <div class="border-y border-dashed border-slate-300 dark:border-slate-700 py-5 space-y-4 text-sm">
                <div class="flex justify-between gap-4">
                    <span class="text-slate-500 font-bold">Mã GD</span>
                    <span class="font-extrabold text-slate-800 dark:text-white">${data.maGD}</span>
                </div>

                <div class="flex justify-between gap-4">
                    <span class="text-slate-500 font-bold">Ngày GD</span>
                    <span class="font-bold text-slate-700 dark:text-slate-200">${data.ngayGD}</span>
                </div>

                <div>
                    <div class="text-slate-500 font-bold mb-1">TK nguồn</div>
                    <div class="font-mono font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-850 rounded-xl px-4 py-3">${data.tkNguon}</div>
                </div>

                <div>
                    <div class="text-slate-500 font-bold mb-1">TK nhận</div>
                    <div class="font-mono font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-850 rounded-xl px-4 py-3">${data.tkDich}</div>
                </div>

                <div class="flex justify-between gap-4 items-center">
                    <span class="text-slate-500 font-bold">Số tiền</span>
                    <span class="text-xl font-extrabold text-emerald-600">${data.soTien}</span>
                </div>

                <div class="flex justify-between gap-4 items-center">
                    <span class="text-slate-500 font-bold">Trạng thái</span>
                    <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-xs">✓ Thành công</span>
                </div>
            </div>

            <button onclick="document.getElementById('receiptModal').remove()"
                class="mt-6 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all">
                Đóng biên lai
            </button>
        </div>
    `;

    document.body.appendChild(modal);
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
        overlay.onclick = function () {
    if (typeof window.toggleSidebar === "function") {
        window.toggleSidebar();
    }
};
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
        sidebarEl.style.cssText = "background: linear-gradient(185deg, #01479d 0%, #0066cc 55%, #13aeea 100%); color: white; border-right: 1px solid rgba(255,255,255,0.07); box-shadow: 4px 0 30px rgba(0,0,0,0.25);";
        sidebarEl.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;justify-content:space-between;">
                <div>
                    <!-- Brand Section -->
<div class="brand-text" style="
    display:flex;
    justify-content:center;
    align-items:center;
    padding:12px 16px;
    border-bottom:1px solid rgba(255,255,255,0.08);
">
    <img src="/bank-ui/assets/logo-smartbank-2026.png"
         alt="GT SmartBank"
         style="
            width:240px;
            max-width:100%;
            height:auto;
            display:block;
         ">
</div>

                    <!-- Navigation Menu -->
                    <nav style="display:flex;flex-direction:column;gap:4px;padding:16px 12px;">
                        <a href="/bank-ui/admin/dashboard.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isIndexActive ? 'background:rgba(255,255,255,0.16);color:#ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:rgba(255,255,255,0.9);'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Tổng quan">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                            <span class="nav-text">Tổng quan</span>
                        </a>
                        <a href="/bank-ui/pages/khachhang.html" id="navCustomers" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('khachhang.html') ? 'background:#ffffff;color:#01479d;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:#ffffff;'}${(
    currentRole !== 'admin' &&
    currentRole !== 'staff' &&
    currentRole !== 'nhanvien' &&
    currentRole !== 'nhân viên' &&
    currentRole !== 'employee'
) ? 'display:none;' : ''}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Khách hàng">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            <span class="nav-text">Khách hàng</span>
                        </a>
                        <a href="/bank-ui/pages/taikhoan.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('taikhoan.html') ? 'background:#ffffff;color:#01479d;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:#ffffff;'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Tài khoản">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                            <span class="nav-text">Tài khoản</span>
                        </a>
                        <a href="/bank-ui/pages/chuyentien.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('chuyentien.html') ? 'background:#ffffff;color:#01479d;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:#ffffff;'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Chuyển tiền">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/></svg>
                            <span class="nav-text">Chuyển tiền</span>
                        </a>
                        <a href="/bank-ui/pages/giaodich.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('giaodich.html') ? 'background:#ffffff;color:#01479d;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:#ffffff;'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Giao dịch">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            <span class="nav-text">Giao dịch</span>
                        </a>
                        <a href="/bank-ui/pages/sotietkiem.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('sotietkiem.html') ? 'background:#ffffff;color:#01479d;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:#ffffff;'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Sổ tiết kiệm">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;flex-shrink:0;"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                            <span class="nav-text">Sổ tiết kiệm</span>
                        </a>
                        <a href="/bank-ui/pages/chi-nhanh-atm.html" class="nav-link" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;${isActive('chi-nhanh-atm.html') ? 'background:#ffffff;color:#01479d;box-shadow:0 4px 12px rgba(0,0,0,0.15);' : 'color:#ffffff;'}" onmouseover="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='rgba(255,255,255,0.1)';this.style.color='white';}" onmouseout="if(!this.style.background.includes('rgb(255, 255, 255)') && !this.style.background.includes('#ffffff') && !this.style.background.includes('white')){this.style.background='';this.style.color='rgba(255,255,255,0.7)';}" data-tooltip="Chi nhánh & ATM">
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

let userRole = "Khách hàng";

if (currentRole === "admin") {
    userRole = "Quản trị viên";
}
else if (
    currentRole === "staff" ||
    currentRole === "nhanvien" ||
    currentRole === "nhân viên" ||
    currentRole === "employee"
) {
    userRole = "Nhân viên";
}
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
// Chỉ hiện chatbot khi CHƯA đăng nhập
(function () {
    const user = getSavedUser();

    // Nếu đã đăng nhập thì xóa sạch chatbot nếu còn tồn tại
    if (user) {
        document.getElementById("ai-assistant-script")?.remove();
        document.getElementById("aiChatWidget")?.remove();
        document.getElementById("ai-assistant-styles")?.remove();
        return;
    }

    const path = window.location.pathname.toLowerCase();

    const allowChatbot =
        path.includes("/bank-ui/index.html") ||
        path === "/" ||
        path.includes("/bank-ui/pages/login.html");

    if (!allowChatbot) return;

    if (!document.getElementById("ai-assistant-script")) {
        const script = document.createElement("script");
        script.id = "ai-assistant-script";
        script.src = "/bank-ui/js/ai-assistant.js";
        script.async = true;
        document.head.appendChild(script);
    }
})();