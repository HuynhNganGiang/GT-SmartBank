let myChart = null;

// ====================================================
// Helper: Set text/html an toàn (tránh lỗi null)
// ====================================================
function setEl(id, value, isHtml = false) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isHtml) {
        el.innerHTML = value;
    } else {
        el.innerText = value;
    }
}

// ====================================================
// Helper: Gọi API an toàn - không throw, trả về [] nếu lỗi
// và hiển thị thông báo lỗi thân thiện lên UI
// ====================================================
async function safeApiGet(endpoint, fallback = null) {
    try {
        const res = await apiGet(endpoint);
        return (res && res.data !== undefined) ? res.data : (fallback ?? []);
    } catch (err) {
        console.warn(`[Dashboard] API lỗi [${endpoint}]:`, err.message);
        return fallback ?? [];
    }
}

// ====================================================
// Helper: Hiển thị / ẩn banner lỗi thân thiện
// ====================================================
function showDashboardError(message) {
    let banner = document.getElementById("dashboardErrorBanner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "dashboardErrorBanner";
        banner.style.cssText = [
            "display:flex", "align-items:center", "gap:12px",
            "background:rgba(220,53,69,0.12)", "border:1px solid rgba(220,53,69,0.35)",
            "border-radius:14px", "padding:14px 18px", "margin-bottom:20px",
            "font-size:14px", "font-weight:600", "color:#dc3545",
            "animation:fadeIn .3s ease"
        ].join(";");
        // Chèn trước section đầu tiên trong main
        const main = document.querySelector("main");
        const firstSection = main ? main.querySelector("section") : null;
        if (firstSection) {
            main.insertBefore(banner, firstSection);
        } else if (main) {
            main.prepend(banner);
        }
    }
    banner.innerHTML = `
        <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#dc3545;flex-shrink:0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>${message}</span>
        <button onclick="this.parentElement.style.display='none'" style="margin-left:auto;background:none;border:none;cursor:pointer;color:#dc3545;font-size:18px;line-height:1;">×</button>
    `;
    banner.style.display = "flex";
}

function hideDashboardError() {
    const banner = document.getElementById("dashboardErrorBanner");
    if (banner) banner.style.display = "none";
}

// ====================================================
// Helper: Cập nhật card Trạng thái dịch vụ
// ====================================================
function updateSystemStatus(isOk, message) {
    const statusEl = document.getElementById("systemStatus");
    const messageEl = document.getElementById("systemMessage");
    if (statusEl) {
        statusEl.innerText = isOk ? "Online" : "Lỗi kết nối";
        statusEl.className = isOk
            ? "text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none mb-2"
            : "text-2xl font-extrabold text-red-500 dark:text-red-400 tracking-tight leading-none mb-2";
    }
    if (messageEl) {
        messageEl.innerText = message || (isOk ? "Kết nối SQL Server ổn định" : "Không thể kết nối máy chủ");
    }
}

// Kiểm tra trạng thái đăng nhập
const user = getCurrentUser();
if (!user) {
    window.location.href = "/bank-ui/pages/login.html";
}

function logout() {
    removeToken();
    removeCurrentUser();
    localStorage.removeItem("refreshToken");
    window.location.href = "/bank-ui/pages/login.html";
}

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function formatCardNumber(accNum) {
    if (!accNum) return "•••• •••• •••• ••••";
    let clean = accNum.toString().replace(/\s+/g, '');
    if (clean.length < 16) {
        clean = clean.padStart(16, '0');
    }
    return clean.replace(/(\d{4})/g, '$1 ').trim();
}

function toUnsignedUpperCase(str) {
    if (!str) return "";
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/Đ/g, 'D')
              .toUpperCase();
}

// Thiết lập hiệu ứng nghiêng 3D cho thẻ Virtual Card
function setupVirtualCard3DEffect() {
    const card = document.querySelector('.virtual-card');
    if (!card) return;
    
    let shine = card.querySelector('.card-shine');
    if (!shine) {
        shine = document.createElement('div');
        shine.className = 'card-shine';
        card.appendChild(shine);
    }
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const px = (x / rect.width) * 100;
        const py = (y / rect.height) * 100;
        
        const tiltX = ((y / rect.height) - 0.5) * -15;
        const tiltY = ((x / rect.width) - 0.5) * 15;
        
        card.style.setProperty('--tilt-x', `${tiltX}deg`);
        card.style.setProperty('--tilt-y', `${tiltY}deg`);
        card.style.setProperty('--shine-x', `${px}%`);
        card.style.setProperty('--shine-y', `${py}%`);
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--shine-x', '50%');
        card.style.setProperty('--shine-y', '50%');
    });
}

async function loadDashboardData() {
    if (!user) return;

    // Cập nhật thông tin header (do theme.js inject)
    setEl("userFullName", user.hoTen);
    setEl("userRole", user.role === "Admin" ? "Quản trị viên" : "Khách hàng");

    let hasAnyError = false;

    try {
        if (user.role === "Admin") {
            // ── Lấy từng API riêng lẻ, lỗi không lan sang nhau ──
            const [customersList, accountsList, transactionsList] = await Promise.all([
                safeApiGet("customers"),
                safeApiGet("accounts"),
                safeApiGet("transactions")
            ]);

            // Kiểm tra có dữ liệu thực không (nếu 3 cái đều trống → có thể API lỗi)
            if (!customersList.length && !accountsList.length && !transactionsList.length) {
                hasAnyError = true;
                showDashboardError("Không thể tải dữ liệu từ máy chủ. Có thể SQL Server chưa kết nối hoặc phiên đăng nhập đã hết hạn.");
                updateSystemStatus(false, "Không nhận được dữ liệu từ API");
            } else {
                hideDashboardError();
                updateSystemStatus(true);
            }

            // Hiển thị lên UI dù có lỗi hay không (hiển thị 0 thay vì crash)
            setEl("dashboardTitle", "Hệ thống Quản trị ngân hàng");

            setEl("statLabel1", "Tổng khách hàng");
            setEl("statValue1", customersList.length);
            setEl("statSub1", `<span class="stat-badge">Hệ thống</span> Khách hàng đăng ký`, true);

            setEl("statLabel2", "Tổng tài khoản");
            setEl("statValue2", accountsList.length);
            setEl("statSub2", `<span class="stat-badge">Thanh toán</span> Tài khoản đang hoạt động`, true);

            setEl("statLabel3", "Tổng giao dịch");
            setEl("statValue3", transactionsList.length);
            setEl("statSub3", `<span class="stat-badge">Phát sinh</span> Lịch sử giao dịch`, true);

            // Cập nhật tiêu đề biểu đồ (giữ nguyên thẻ <span> con)
            const chartTitleEl = document.getElementById("chartTitle");
            if (chartTitleEl) {
                const span = chartTitleEl.querySelector("span");
                chartTitleEl.innerHTML = (span ? span.outerHTML : '') + ' Biểu đồ phân tích kinh doanh hệ thống';
            }

            setEl("recentTxHeaderTitle", "🕒 Giao dịch toàn hệ thống");

            renderAdminGroupedChart(transactionsList);
            renderRecentTransactions(transactionsList);

            // Ẩn thẻ ngân hàng ảo đối với Admin
            const vcContainer = document.getElementById("virtualCardContainer");
            if (vcContainer) {
                vcContainer.style.display = "none";
                vcContainer.classList.add("hidden");
            }

        } else {
            // ── Khách hàng thường ──
            const [accountsList, transactionsList, savingsList] = await Promise.all([
                safeApiGet("accounts"),
                safeApiGet("transactions/my"),
                safeApiGet("savings-accounts")
            ]);

            // Kiểm tra kết nối
            if (!accountsList.length && !transactionsList.length) {
                hasAnyError = true;
                showDashboardError("Không thể tải dữ liệu tài khoản. Vui lòng thử đồng bộ lại hoặc đăng nhập lại.");
                updateSystemStatus(false, "Lỗi tải dữ liệu cá nhân");
            } else {
                hideDashboardError();
                updateSystemStatus(true);
            }

            // Tính tổng (dù trống vẫn hiện 0, không crash)
            const totalBalance = accountsList.reduce((sum, item) => sum + (item.soDu || 0), 0);
            const totalSavings = savingsList.reduce((sum, item) => sum + (item.trangThai === "HoatDong" ? (item.soTienGoc || 0) : 0), 0);
            const activeSavingsCount = savingsList.filter(s => s.trangThai === "HoatDong").length;

            setEl("dashboardTitle", "Tổng quan tài khoản cá nhân");
            setEl("bannerTitle", "Chào mừng quay trở lại!");
            setEl("bannerDesc",
                `Chào mừng bạn đến với GT Smart Bank. Bạn đang có ${accountsList.length} tài khoản thanh toán và ${activeSavingsCount} sổ tiết kiệm đang hoạt động.`
            );

            const bannerBtn = document.getElementById("bannerActionBtn");
            if (bannerBtn) {
                bannerBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg><span>Mở sổ tiết kiệm ngay</span>`;
                bannerBtn.href = "/bank-ui/pages/sotietkiem.html";
            }

            setEl("statLabel1", "Số dư tài khoản");
            setEl("statValue1", formatVND(totalBalance));
            setEl("statSub1", `<span class="stat-badge">Thanh toán</span> Cộng dồn tài khoản`, true);

            setEl("statLabel2", "Số dư tiết kiệm");
            setEl("statValue2", formatVND(totalSavings));
            setEl("statSub2", `<span class="stat-badge">Tiết kiệm</span> Đang sinh lời`, true);

            setEl("statLabel3", "Giao dịch cá nhân");
            setEl("statValue3", transactionsList.length);
            setEl("statSub3", `<span class="stat-badge">Biến động</span> Lịch sử giao dịch`, true);

            // Cập nhật tiêu đề biểu đồ (giữ nguyên thẻ <span> con)
            const chartTitleEl = document.getElementById("chartTitle");
            if (chartTitleEl) {
                const span = chartTitleEl.querySelector("span");
                chartTitleEl.innerHTML = (span ? span.outerHTML : '') + ' Phân tích biến động dòng tiền (6 tháng)';
            }

            setEl("recentTxHeaderTitle", "🕒 Giao dịch của bạn gần đây");

            // Hiển thị thẻ ngân hàng ảo 3D
            const cardContainer = document.getElementById("virtualCardContainer");
            if (cardContainer) {
                cardContainer.style.display = "flex";
                cardContainer.classList.remove("hidden");
                setEl("virtualCardHolder", toUnsignedUpperCase(user.hoTen));
                setEl("virtualCardNumber",
                    accountsList.length > 0
                        ? formatCardNumber(accountsList[0].soTaiKhoan)
                        : "CHƯA CÓ TÀI KHOẢN"
                );
            }

            renderUserFlowChart(transactionsList, accountsList);
            renderRecentTransactions(transactionsList, accountsList);
        }

        setEl("lastUpdate",
            hasAnyError
                ? "⚠ Dữ liệu có thể chưa đầy đủ – " + new Date().toLocaleString("vi-VN")
                : "✔ Cập nhật lần cuối: " + new Date().toLocaleString("vi-VN")
        );

    } catch (error) {
        // Lỗi ngoài dự kiến - hiển thị banner thay vì crash trang
        console.error("Lỗi nghiêm trọng khi load dashboard:", error);
        showDashboardError(error.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
        updateSystemStatus(false, "Lỗi kết nối hệ thống");
        setEl("lastUpdate", "Lỗi đồng bộ – " + new Date().toLocaleString("vi-VN"));
    }
}

// Biểu đồ cho Admin: Grouped Bar Chart so sánh tiết kiệm vs giao dịch khác
function renderAdminGroupedChart(transactions) {
    const canvas = document.getElementById('dashboardChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (myChart) {
        myChart.destroy();
    }
    
    const isDark = document.body.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#f5f5f5' : '#222222';
    
    const months = [];
    const monthLabels = [];
    const savingsData = [0, 0, 0, 0, 0, 0];
    const volumeData = [0, 0, 0, 0, 0, 0];
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() });
        monthLabels.push(`Tháng ${d.getMonth() + 1}/${d.getFullYear().toString().substr(-2)}`);
    }
    
    transactions.forEach(tx => {
        const txDate = new Date(tx.ngayGiaoDich || tx.ngayTao || 0);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();
        
        const mIdx = months.findIndex(m => m.year === txYear && m.month === txMonth);
        if (mIdx !== -1) {
            const sotien = tx.soTien || tx.soTienGoc || 0;
            if (tx.loaiGiaoDich === "MoSo" || tx.loaiGiaoDich === "Savings") {
                savingsData[mIdx] += sotien;
            } else {
                volumeData[mIdx] += sotien;
            }
        }
    });
    
    const hasData = savingsData.some(v => v > 0) || volumeData.some(v => v > 0);
    if (!hasData) {
        savingsData.splice(0, 6, 120000000, 180000000, 150000000, 220000000, 290000000, 350000000);
        volumeData.splice(0, 6, 310000000, 420000000, 390000000, 480000000, 560000000, 620000000);
    }
    
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Tiền gửi tiết kiệm mới',
                    data: savingsData,
                    backgroundColor: '#f7b500',
                    borderColor: '#d97706',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Giao dịch khác',
                    data: volumeData,
                    backgroundColor: '#b60000',
                    borderColor: '#9c0000',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
                },
                tooltip: {
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.dataset.label}: ${formatVND(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Outfit', size: 12 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit', size: 12 },
                        callback: function(value) {
                            if (value >= 1e6) return (value / 1e6) + ' triệu';
                            return value.toLocaleString('vi-VN');
                        }
                    }
                }
            }
        }
    });
}

// Biểu đồ cho User: Area/Line Chart so sánh Inflow vs Outflow dòng tiền
function renderUserFlowChart(transactions, myAccounts) {
    const canvas = document.getElementById('dashboardChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (myChart) {
        myChart.destroy();
    }
    
    const isDark = document.body.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#f5f5f5' : '#222222';
    
    const myAccNums = (myAccounts || []).map(a => a.soTaiKhoan.toString());
    
    const months = [];
    const monthLabels = [];
    const inflowData = [0, 0, 0, 0, 0, 0];
    const outflowData = [0, 0, 0, 0, 0, 0];
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() });
        monthLabels.push(`Tháng ${d.getMonth() + 1}/${d.getFullYear().toString().substr(-2)}`);
    }
    
    transactions.forEach(tx => {
        const txDate = new Date(tx.ngayGiaoDich || tx.ngayTao || 0);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();
        
        const mIdx = months.findIndex(m => m.year === txYear && m.month === txMonth);
        if (mIdx !== -1) {
            const isNguon = myAccNums.includes(tx.soTaiKhoanNguon?.toString());
            const isNhan = myAccNums.includes(tx.soTaiKhoanNhan?.toString());
            const sotien = tx.soTien || tx.soTienGoc || 0;
            
            if (tx.loaiGiaoDich === "NapTien" || tx.loaiGiaoDich === "Deposit") {
                inflowData[mIdx] += sotien;
            } else if (tx.loaiGiaoDich === "ChuyenTien" || tx.loaiGiaoDich === "Transfer") {
                if (isNguon && !isNhan) {
                    outflowData[mIdx] += sotien;
                } else if (!isNguon && isNhan) {
                    inflowData[mIdx] += sotien;
                }
            } else {
                outflowData[mIdx] += sotien;
            }
        }
    });
    
    const hasData = inflowData.some(v => v > 0) || outflowData.some(v => v > 0);
    if (!hasData) {
        inflowData.splice(0, 6, 8000000, 12000000, 10500000, 16000000, 14000000, 20000000);
        outflowData.splice(0, 6, 5000000, 7500000, 9000000, 11000000, 8500000, 13000000);
    }
    
    const gradInflow = ctx.createLinearGradient(0, 0, 0, 300);
    gradInflow.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradInflow.addColorStop(1, 'rgba(16, 185, 129, 0.00)');
    
    const gradOutflow = ctx.createLinearGradient(0, 0, 0, 300);
    gradOutflow.addColorStop(0, 'rgba(220, 53, 69, 0.35)');
    gradOutflow.addColorStop(1, 'rgba(220, 53, 69, 0.00)');
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Dòng tiền vào (Inflow)',
                    data: inflowData,
                    borderColor: '#10b981',
                    backgroundColor: gradInflow,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#10b981',
                    pointHoverRadius: 7
                },
                {
                    label: 'Dòng tiền ra (Outflow)',
                    data: outflowData,
                    borderColor: '#dc3545',
                    backgroundColor: gradOutflow,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#dc3545',
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
                },
                tooltip: {
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.dataset.label}: ${formatVND(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Outfit', size: 12 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit', size: 12 },
                        callback: function(value) {
                            if (value >= 1e6) return (value / 1e6) + ' triệu';
                            return value.toLocaleString('vi-VN');
                        }
                    }
                }
            }
        }
    });
}

// Render danh sách giao dịch dưới dạng Fintech Table
function renderRecentTransactions(transactions, myAccounts = null) {
    const listContainer = document.getElementById("recentTransactionsList");
    if (!listContainer) return;

    if (!transactions || transactions.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Không có giao dịch gần đây.</div>`;
        return;
    }

    const sorted = [...transactions]
        .sort((a, b) => new Date(b.ngayGiaoDich || b.ngayTao || 0) - new Date(a.ngayGiaoDich || a.ngayTao || 0))
        .slice(0, 5);

    const myAccNums = myAccounts ? myAccounts.map(a => a.soTaiKhoan.toString()) : [];

    let tableHtml = `
        <div class="fintech-table-container">
            <table class="fintech-table">
                <thead>
                    <tr>
                        <th>Mã GD</th>
                        <th>Chi tiết giao dịch</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
    `;

    sorted.forEach(tx => {
        const dateStr = new Date(tx.ngayGiaoDich || tx.ngayTao).toLocaleDateString("vi-VN", {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });

        let amountClass = "";
        let amountPrefix = "";
        let description = "";

        const sotien = tx.soTien || tx.soTienGoc || 0;

        if (user.role === "Admin") {
            if (tx.loaiGiaoDich === "ChuyenTien" || tx.loaiGiaoDich === "Transfer") {
                amountClass = "minus";
                amountPrefix = "-";
                description = `Chuyển khoản: ${tx.soTaiKhoanNguon} → ${tx.soTaiKhoanNhan}`;
            } else if (tx.loaiGiaoDich === "NapTien" || tx.loaiGiaoDich === "Deposit") {
                amountClass = "plus";
                amountPrefix = "+";
                description = `Nạp tiền vào tài khoản ${tx.soTaiKhoanNhan}`;
            } else if (tx.loaiGiaoDich === "MoSo" || tx.loaiGiaoDich === "Savings") {
                amountClass = "minus";
                amountPrefix = "-";
                description = `Mở sổ TK: TK ${tx.soTaiKhoanNguon}`;
            } else {
                amountClass = "plus";
                amountPrefix = "+";
                description = tx.noiDung || "Giao dịch hệ thống";
            }
        } else {
            const isNguonCuaToi = myAccNums.includes(tx.soTaiKhoanNguon?.toString());
            const isNhanCuaToi = myAccNums.includes(tx.soTaiKhoanNhan?.toString());

            if (tx.loaiGiaoDich === "NapTien" || tx.loaiGiaoDich === "Deposit") {
                amountClass = "plus";
                amountPrefix = "+";
                description = tx.noiDung || `Nạp tiền vào TK ${tx.soTaiKhoanNhan}`;
            } else if (tx.loaiGiaoDich === "ChuyenTien" || tx.loaiGiaoDich === "Transfer") {
                if (isNguonCuaToi && isNhanCuaToi) {
                    amountClass = "plus";
                    amountPrefix = " ";
                    description = `Chuyển khoản nội bộ`;
                } else if (isNguonCuaToi) {
                    amountClass = "minus";
                    amountPrefix = "-";
                    description = tx.noiDung || `Chuyển đến TK ${tx.soTaiKhoanNhan}`;
                } else if (isNhanCuaToi) {
                    amountClass = "plus";
                    amountPrefix = "+";
                    description = tx.noiDung || `Nhận từ TK ${tx.soTaiKhoanNguon}`;
                } else {
                    amountClass = "plus";
                    amountPrefix = "";
                    description = tx.noiDung || "Giao dịch phát sinh";
                }
            } else {
                amountClass = "minus";
                amountPrefix = "-";
                description = tx.noiDung || `Mở sổ tiết kiệm từ TK ${tx.soTaiKhoanNguon}`;
            }
        }

        let statusText = "Thành công";
        let statusClass = "success";
        const status = tx.trangThai || "Success";
        if (status === "Failed" || status === "ThatBai") {
            statusText = "Thất bại";
            statusClass = "failed";
        } else if (status === "Pending" || status === "ChoXuLy") {
            statusText = "Đang xử lý";
            statusClass = "pending";
        }

        const maGD = tx.maGiaoDich || tx.id || `TXN-${Math.floor(1000 + Math.random() * 9000)}`;

        tableHtml += `
            <tr>
                <td style="font-weight: 700; font-family: monospace; font-size: 13px; color: var(--accent-primary);">${maGD}</td>
                <td>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: 600; font-size: 13px;">${description}</span>
                        <span style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${dateStr}</span>
                    </div>
                </td>
                <td class="tx-amount ${amountClass}" style="font-weight: 700; font-size: 13px; white-space: nowrap;">
                    ${amountPrefix}${formatVND(sotien)}
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
            </tr>
        `;
    });

    tableHtml += `
                </tbody>
            </table>
        </div>
    `;

    listContainer.innerHTML = tableHtml;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!user) return;

    // Ẩn menu Khách hàng đối với người dùng thường
    // (Được gọi sau DOMContentLoaded để theme.js kịp inject navCustomers vào DOM)
    if (user.role !== "Admin") {
        const navCustomers = document.getElementById("navCustomers");
        if (navCustomers) {
            navCustomers.style.display = "none";
        }
    }

    loadDashboardData();
    setupVirtualCard3DEffect();
    
    // Tự động làm mới dữ liệu sau mỗi 30 giây
    setInterval(() => {
        loadDashboardData();
    }, 30000);
});