// GT SmartBank Public JS Library

document.addEventListener("DOMContentLoaded", () => {
    // 1. Sync Authentication state on public header
    syncHeaderAuth();

    // 2. Setup Registration modal listeners
    setupRegistrationModal();

    // 3. Calculator (if present in pages)
    setupCalculator();

    // 4. Rate details updates
    updateExchangeRates();

    // 5. Hero interactions
    setupHeroInteractions();

    // 6. Global animations
    setupGlobalAnimations();
});

// Sync user auth status in header
function syncHeaderAuth() {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    let user = null;
    if (token && userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            console.error("Error parsing user info:", e);
        }
    }

    const authContainer = document.getElementById("header-auth-container");
    if (!authContainer) return;

    if (user) {
        authContainer.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="hidden md:inline-block text-xs font-semibold text-slate-600">Chào, <strong class="text-brand-800">${user.hoTen}</strong></span>
                <a href="/bank-ui/admin/dashboard.html" class="px-4 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-full transition-all shadow-sm shadow-red-100 flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-current"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    Dashboard
                </a>
                <button onclick="publicLogout()" class="px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 rounded-full transition-all">
                    Đăng xuất
                </button>
            </div>
        `;
    } else {
        authContainer.innerHTML = `
            <a href="/pages/login.html" class="px-4 py-2 text-xs font-bold text-slate-700 hover:text-brand-850 transition-colors">
                Đăng nhập
            </a>
            <button onclick="openRegisterModal()" class="px-4 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-full transition-all shadow-md shadow-red-150">
                Mở tài khoản
            </button>
        `;
    }
}

// Global logout function for public pages
window.publicLogout = function() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    
    if (typeof window.showToast === "function") {
        window.showToast("Đăng xuất thành công", "success", 1200);
    }
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};

// Modal functions
let registerModal = null;

function setupRegistrationModal() {
    // Create modal element dynamically if not present
    if (!document.getElementById("register-modal")) {
        const modalHtml = `
            <div id="register-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300">
                <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl transform scale-95 opacity-0 transition-all duration-300 relative mx-4">
                    <button onclick="closeRegisterModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                    
                    <div class="text-center mb-6">
                        <div class="w-12 h-12 bg-amber-50 rounded-2xl text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-100">
                            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800">Mở tài khoản GT SmartBank</h3>
                        <p class="text-xs text-slate-500 mt-1">Trải nghiệm dịch vụ tài chính hiện đại chỉ trong 2 phút</p>
                    </div>

                    <form id="public-register-form" onsubmit="handlePublicRegister(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Họ và tên</label>
                            <input type="text" id="reg-name" required placeholder="Nguyen Van A" class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-800 transition-all font-medium">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Số điện thoại</label>
                            <input type="tel" id="reg-phone" required placeholder="0901234567" class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-800 transition-all font-medium">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Mật khẩu bảo mật</label>
                            <input type="password" id="reg-pass" required placeholder="••••••••" class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-800 transition-all font-medium">
                        </div>
                        <div class="flex items-start gap-2 pt-1">
                            <input type="checkbox" id="reg-terms" required class="mt-1 rounded border-slate-350 text-brand-800 focus:ring-brand-800">
                            <label for="reg-terms" class="text-[11px] text-slate-500 leading-normal font-medium">Tôi đồng ý với <a href="#" class="text-brand-800 underline">điều khoản dịch vụ</a> và cho phép sử dụng thông tin để liên hệ hỗ trợ.</label>
                        </div>

                        <button type="submit" class="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-100 mt-2">
                            Đăng ký ngay
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    registerModal = document.getElementById("register-modal");
}

window.openRegisterModal = function() {
    if (!registerModal) setupRegistrationModal();
    
    registerModal.classList.remove("opacity-0", "pointer-events-none");
    const container = registerModal.querySelector("div");
    container.classList.remove("scale-95", "opacity-0");
    container.classList.add("scale-100", "opacity-100");
};

window.closeRegisterModal = function() {
    if (!registerModal) return;
    
    registerModal.classList.add("opacity-0", "pointer-events-none");
    const container = registerModal.querySelector("div");
    container.classList.remove("scale-100", "opacity-100");
    container.classList.add("scale-95", "opacity-0");
};

// Handle registration request
window.handlePublicRegister = async function(e) {
    e.preventDefault();
    
    const hoTen = document.getElementById("reg-name").value.trim();
    const soDienThoai = document.getElementById("reg-phone").value.trim();
    const matKhau = document.getElementById("reg-pass").value.trim();
    
    if (!hoTen || !soDienThoai || !matKhau) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    try {
        // Send request directly to API read from CONFIG
        const apiUrl = typeof CONFIG !== "undefined" ? CONFIG.API_BASE_URL : "https://gtsmartbank-api.onrender.com/api";
        const response = await fetch(apiUrl + "/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                hoTen: hoTen,
                soDienThoai: soDienThoai,
                matKhau: matKhau,
                email: soDienThoai + "@gtsmartbank.com.vn",
                role: "Khách hàng"
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert("Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.");
            closeRegisterModal();
            window.location.href = "/pages/login.html";
        } else {
            alert(data.message || "Đăng ký không thành công. Số điện thoại có thể đã tồn tại.");
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi kết nối máy chủ. Hãy thử đăng ký lại sau.");
    }
};

// Interest Calculator logic
function setupCalculator() {
    const calcBtn = document.getElementById("calc-btn");
    if (!calcBtn) return;

    calcBtn.addEventListener("click", () => {
        const amount = parseFloat(document.getElementById("calc-amount").value) || 0;
        const term = parseInt(document.getElementById("calc-term").value) || 1;
        
        // Simulating interest rates
        // 1-3m: 3.5%, 6m: 5.0%, 12m: 6.0%, 24m: 6.2%
        let rate = 3.5;
        if (term === 6) rate = 5.0;
        else if (term === 12) rate = 6.0;
        else if (term === 24) rate = 6.2;
        
        const interest = amount * (rate / 100) * (term / 12);
        const total = amount + interest;
        
        const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
        
        document.getElementById("calc-rate-val").innerText = rate + "% / năm";
        document.getElementById("calc-interest-val").innerText = formatMoney(interest);
        document.getElementById("calc-total-val").innerText = formatMoney(total);
    });
}

// Update exchange rates simulation
function updateExchangeRates() {
    const table = document.getElementById("exchange-rates-tbody");
    if (!table) return;

    const rates = [
        { code: "USD", buy: 25230, sell: 25480, change: "+15" },
        { code: "EUR", buy: 27150, sell: 27950, change: "-40" },
        { code: "JPY", buy: 158.5, sell: 165.2, change: "+0.8" },
        { code: "GBP", buy: 31800, sell: 32600, change: "+25" },
        { code: "AUD", buy: 16400, sell: 17100, change: "-10" }
    ];

    table.innerHTML = rates.map(r => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="px-4 py-2 font-bold text-slate-800 text-xs">${r.code}</td>
            <td class="px-4 py-2 text-right font-semibold text-slate-700 text-xs">${r.buy.toLocaleString()}</td>
            <td class="px-4 py-2 text-right font-semibold text-slate-750 text-xs">${r.sell.toLocaleString()}</td>
            <td class="px-4 py-2 text-center text-[10px] font-bold ${r.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"}">${r.change}</td>
        </tr>
    `).join("");
}

// Hero banner interactions (3D card tilt & tab switcher)
function setupHeroInteractions() {
    const card = document.getElementById("premium-card-mockup");
    if (card) {
        const cardParent = card.parentElement;
        if (cardParent) {
            // Disable default float animation on hover to prevent jumping
            cardParent.addEventListener("mouseenter", () => {
                card.classList.remove("premium-card-float");
            });

            cardParent.addEventListener("mousemove", (e) => {
                const rect = cardParent.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Calculate tilt angles (max 15 degrees)
                const rotateX = -(y / (rect.height / 2)) * 15;
                const rotateY = (x / (rect.width / 2)) * 15;
                
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            });
            
            cardParent.addEventListener("mouseleave", () => {
                card.classList.add("premium-card-float");
                card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
            });
        }
    }
}

// Global function to switch between App and Calculator tabs in Hero
window.switchHeroTab = function(tabName) {
    const tabApp = document.getElementById("hero-tab-app");
    const tabCalc = document.getElementById("hero-tab-calc");
    const contentApp = document.getElementById("hero-content-app");
    const contentCalc = document.getElementById("hero-content-calc");

    if (!tabApp || !tabCalc || !contentApp || !contentCalc) return;

    if (tabName === "app") {
        // Activate App tab
        tabApp.className = "pb-2 text-sm font-bold text-white border-b-2 border-secondary-700 transition-all focus:outline-none flex items-center gap-1.5";
        tabCalc.className = "pb-2 text-sm font-bold text-slate-400 hover:text-white border-b-2 border-transparent transition-all focus:outline-none flex items-center gap-1.5";
        contentApp.classList.remove("hidden");
        contentApp.classList.add("block");
        contentCalc.classList.remove("block");
        contentCalc.classList.add("hidden");
    } else if (tabName === "calc") {
        // Activate Calculator tab
        tabApp.className = "pb-2 text-sm font-bold text-slate-400 hover:text-white border-b-2 border-transparent transition-all focus:outline-none flex items-center gap-1.5";
        tabCalc.className = "pb-2 text-sm font-bold text-white border-b-2 border-secondary-700 transition-all focus:outline-none flex items-center gap-1.5";
        contentApp.classList.remove("block");
        contentApp.classList.add("hidden");
        contentCalc.classList.remove("hidden");
        contentCalc.classList.add("block");
    }
};

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
