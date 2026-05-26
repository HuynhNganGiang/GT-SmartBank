let myChart = null;
let allSystemTransactions = [];
let allSystemCustomers = [];
let allSystemAccounts = [];

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

// Kiểm tra trạng thái đăng nhập
const user = getCurrentUser();
if (!user) {
    window.location.href = "/pages/login.html";
}

function logout() {
    removeToken();
    removeCurrentUser();
    localStorage.removeItem("refreshToken");
    window.location.href = "/pages/login.html";
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

// Setup 3D Card tilt
function setupVirtualCard3DEffect() {
    const card = document.querySelector('.card-shimmer');
    if (!card) return;
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tiltX = ((y / rect.height) - 0.5) * -10;
        const tiltY = ((x / rect.width) - 0.5) * 10;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
}

async function loadDashboardData() {
    if (!user) return;

    // Sync header info
    setEl("userFullName", user.hoTen);
    setEl("userRole", user.role === "Admin" ? "Quản trị viên" : "Khách hàng");

    let hasAnyError = false;

    // Phân luồng hiển thị
    const adminView = document.getElementById("adminDashboardView");
    const customerView = document.getElementById("customerDashboardView");

    if (user.role === "Admin") {
        if (adminView) adminView.classList.remove("hidden");
        if (customerView) customerView.classList.add("hidden");
        
        // Hide card preview on top right if admin
        const vcContainer = document.getElementById("virtualCardContainer");
        if (vcContainer) vcContainer.classList.add("hidden");

        try {
            // Load admin statistics
            const [customersList, accountsList, transactionsList] = await Promise.all([
                safeApiGet("customers"),
                safeApiGet("accounts"),
                safeApiGet("transactions")
            ]);

            allSystemTransactions = transactionsList;
            allSystemCustomers = customersList;
            allSystemAccounts = accountsList;

            if (!customersList.length && !accountsList.length && !transactionsList.length) {
                hasAnyError = true;
                showDashboardError("Không thể tải dữ liệu từ máy chủ. Có thể SQL Server chưa kết nối hoặc phiên làm việc hết hạn.");
            } else {
                hideDashboardError();
            }

            // Calculate deposits
            const totalDeposits = accountsList.reduce((sum, acc) => sum + (acc.soDu || 0), 0);

            // Bind values
            setEl("adminTotalCustomers", customersList.length + " khách hàng");
            setEl("adminTotalDeposits", formatVND(totalDeposits));
            setEl("adminTotalTransactions", transactionsList.length + " giao dịch");
            setEl("adminLastUpdate", "Cập nhật lúc: " + new Date().toLocaleTimeString("vi-VN"));

            // Dynamic System Performance simulation
            const statusEl = document.getElementById("adminSystemStatus");
            const msgEl = document.getElementById("adminSystemMessage");
            if (statusEl) {
                statusEl.innerText = "Online (99.99%)";
                statusEl.className = "text-2xl font-black text-emerald-600 dark:text-emerald-450 tracking-tight leading-none mb-1.5 animate-pulse";
            }
            if (msgEl) {
                msgEl.innerText = `Kết nối Core-bank hoạt động ổn định`;
            }

            // Render Chart & Tables
            updateAdminChart();
            filterAdminTransactions();
            
            // Generate background logs mock
            initAuditLogs();

        } catch (error) {
            console.error("Lỗi load admin dashboard:", error);
            showDashboardError("Lỗi hệ thống: " + error.message);
        }
    } else {
        if (customerView) customerView.classList.remove("hidden");
        if (adminView) adminView.classList.add("hidden");

        try {
            const [accountsList, transactionsList, savingsList] = await Promise.all([
                safeApiGet("accounts"),
                safeApiGet("transactions/my"),
                safeApiGet("savings-accounts")
            ]);

            if (!accountsList.length && !transactionsList.length) {
                hasAnyError = true;
                showDashboardError("Không thể tải dữ liệu tài khoản. Vui lòng đăng nhập lại.");
            } else {
                hideDashboardError();
            }

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
                bannerBtn.href = "/pages/sotietkiem.html";
            }

            // Cards for customer
            setEl("statLabel1", "Số dư tài khoản");
            setEl("statValue1", formatVND(totalBalance));
            setEl("statSub1", `<span class="stat-badge">Thanh toán</span> Cộng dồn tài khoản`, true);

            setEl("statLabel2", "Số dư tiết kiệm");
            setEl("statValue2", formatVND(totalSavings));
            setEl("statSub2", `<span class="stat-badge">Tiết kiệm</span> Đang sinh lời`, true);

            setEl("statLabel3", "Giao dịch cá nhân");
            setEl("statValue3", transactionsList.length);
            setEl("statSub3", `<span class="stat-badge">Biến động</span> Lịch sử giao dịch`, true);

            const statusEl = document.getElementById("systemStatus");
            const messageEl = document.getElementById("systemMessage");
            if (statusEl) {
                statusEl.innerText = "Online";
                statusEl.className = "text-2xl font-black text-emerald-600 dark:text-emerald-450 tracking-tight leading-none mb-1.5 animate-pulse";
            }
            if (messageEl) {
                messageEl.innerText = "Đường truyền bảo mật SSL";
            }

            setEl("lastUpdate", "Cập nhật lúc: " + new Date().toLocaleTimeString("vi-VN"));

            // Virtual Card
            const cardContainer = document.getElementById("virtualCardContainer");
            if (cardContainer) {
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

        } catch (error) {
            console.error("Lỗi load customer dashboard:", error);
            showDashboardError("Lỗi hệ thống: " + error.message);
        }
    }
}

// Biểu đồ Admin
function updateAdminChart() {
    const canvas = document.getElementById('adminDashboardChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (myChart) {
        myChart.destroy();
    }

    const isDark = document.body.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#f5f5f5' : '#222222';

    const metric = document.getElementById('adminChartMetric')?.value || "COMPARISON";

    // Setup 6 months labels
    const months = [];
    const monthLabels = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() });
        monthLabels.push(`Tháng ${d.getMonth() + 1}/${d.getFullYear().toString().substr(-2)}`);
    }

    const savingsData = [0, 0, 0, 0, 0, 0];
    const otherData = [0, 0, 0, 0, 0, 0];
    const totalVolumeData = [0, 0, 0, 0, 0, 0];

    allSystemTransactions.forEach(tx => {
        const txDate = new Date(tx.thoiGianGD || 0);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();
        const mIdx = months.findIndex(m => m.year === txYear && m.month === txMonth);

        if (mIdx !== -1) {
            const amount = tx.soTien || 0;
            totalVolumeData[mIdx] += amount;
            if (tx.loaiGD === "MoSoTietKiem") {
                savingsData[mIdx] += amount;
            } else {
                otherData[mIdx] += amount;
            }
        }
    });

    // Fallback if no real transactions
    const hasData = totalVolumeData.some(v => v > 0);
    if (!hasData) {
        savingsData.splice(0, 6, 120000000, 180000000, 150000000, 220000000, 290000000, 350000000);
        otherData.splice(0, 6, 310000000, 420000000, 390000000, 480000000, 560000000, 620000000);
        for (let i = 0; i < 6; i++) {
            totalVolumeData[i] = savingsData[i] + otherData[i];
        }
    }

    if (metric === "COMPARISON") {
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [
                    {
                        label: 'Vốn tiết kiệm mới',
                        data: savingsData,
                        backgroundColor: '#f7b500',
                        borderColor: '#d97706',
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: 'Giao dịch chuyển/nạp tiền',
                        data: otherData,
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
                    legend: { labels: { color: textColor, font: { family: 'Poppins', size: 11 } } },
                    tooltip: {
                        padding: 12,
                        callbacks: {
                            label: (ctx) => ` ${ctx.dataset.label}: ${formatVND(ctx.raw)}`
                        }
                    }
                },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Poppins', size: 10 } } },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            font: { family: 'Poppins', size: 10 },
                            callback: (val) => val >= 1e6 ? (val / 1e6) + 'M' : val.toLocaleString('vi-VN')
                        }
                    }
                }
            }
        });
    } else {
        // Line chart for Total Volume
        const grad = ctx.createLinearGradient(0, 0, 0, 300);
        grad.addColorStop(0, 'rgba(182, 0, 0, 0.35)');
        grad.addColorStop(1, 'rgba(182, 0, 0, 0.00)');

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Tổng dòng tiền luân chuyển',
                    data: totalVolumeData,
                    borderColor: '#b60000',
                    backgroundColor: grad,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#b60000',
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: textColor, font: { family: 'Poppins', size: 11 } } },
                    tooltip: {
                        padding: 12,
                        callbacks: {
                            label: (ctx) => ` ${ctx.dataset.label}: ${formatVND(ctx.raw)}`
                        }
                    }
                },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Poppins', size: 10 } } },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            font: { family: 'Poppins', size: 10 },
                            callback: (val) => val >= 1e6 ? (val / 1e6) + 'M' : val.toLocaleString('vi-VN')
                        }
                    }
                }
            }
        });
    }
}

// Lọc giao dịch phía admin
function filterAdminTransactions() {
    const listContainer = document.getElementById("adminTransactionsList");
    if (!listContainer) return;

    const searchVal = (document.getElementById("adminTxSearch")?.value || "").toLowerCase().trim();
    const typeFilter = document.getElementById("adminTxTypeFilter")?.value || "ALL";
    const statusFilter = document.getElementById("adminTxStatusFilter")?.value || "ALL";

    let filtered = [...allSystemTransactions];

    // Search filter (by account sender, receiver, maGD, or content)
    if (searchVal) {
        filtered = filtered.filter(tx => 
            tx.maGD.toString().toLowerCase().includes(searchVal) ||
            (tx.tK_Nguon && tx.tK_Nguon.toLowerCase().includes(searchVal)) ||
            (tx.tK_Dich && tx.tK_Dich.toLowerCase().includes(searchVal)) ||
            (tx.noiDung && tx.noiDung.toLowerCase().includes(searchVal))
        );
    }

    // Type filter
    if (typeFilter !== "ALL") {
        filtered = filtered.filter(tx => tx.loaiGD === typeFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
        filtered = filtered.filter(tx => {
            const status = tx.trangThai || "Success";
            if (statusFilter === "ThanhCong") return status === "ThanhCong" || status === "Success";
            return status === "Failed" || status === "ThatBai";
        });
    }

    // Sort newest first, slice 8
    filtered.sort((a, b) => new Date(b.thoiGianGD) - new Date(a.thoiGianGD));
    const sliced = filtered.slice(0, 8);

    if (sliced.length === 0) {
        listContainer.innerHTML = `<div class="text-center py-10 text-slate-400 text-xs font-bold font-montserrat">KHÔNG CÓ GIAO DỊCH PHÙ HỢP</div>`;
        return;
    }

    let tableHtml = `
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-[11px] font-semibold">
                <thead>
                    <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                        <th class="pb-2">Mã GD</th>
                        <th class="pb-2">Giao dịch</th>
                        <th class="pb-2 text-right">Số tiền</th>
                        <th class="pb-2 text-center">Xem</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 dark:divide-slate-850">
    `;

    sliced.forEach(tx => {
        const typeText = tx.loaiGD === "ChuyenTien" ? "Chuyển khoản" :
                         tx.loaiGD === "NapTien" ? "Nạp tiền" :
                         tx.loaiGD === "MoSoTietKiem" ? "Mở TK tiết kiệm" :
                         tx.loaiGD === "TatToanTietKiem" ? "Tất toán" : tx.loaiGD || "Khác";

        const amountColor = tx.trangThai === "ThanhCong" || tx.trangThai === "Success" 
                            ? (tx.loaiGD === "NapTien" ? "text-emerald-600 dark:text-emerald-450" : "text-rose-600 dark:text-rose-400") 
                            : "text-slate-450 dark:text-slate-550 line-through";

        const prefix = tx.loaiGD === "NapTien" ? "+" : "-";

        tableHtml += `
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                <td class="py-2.5 font-mono text-[12px] text-brand-800 dark:text-secondary-300 font-bold">${tx.maGD}</td>
                <td class="py-2.5">
                    <div class="font-bold text-slate-700 dark:text-slate-200">${typeText}</div>
                    <div class="text-[9px] text-slate-450">${new Date(tx.thoiGianGD).toLocaleString("vi-VN")}</div>
                </td>
                <td class="py-2.5 text-right font-bold ${amountColor}">${prefix}${formatVND(tx.soTien)}</td>
                <td class="py-2.5 text-center">
                    <button onclick="openTxDetailModal(${tx.maGD})" class="p-1 rounded bg-slate-100 dark:bg-slate-800 text-brand-800 dark:text-secondary-400 hover:bg-brand-50 hover:text-brand-900 transition-all font-black text-[10px] uppercase">Xem</button>
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
        const txDate = new Date(tx.thoiGianGD || 0);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();
        
        const mIdx = months.findIndex(m => m.year === txYear && m.month === txMonth);
        if (mIdx !== -1) {
            const isNguon = myAccNums.includes(tx.tK_Nguon?.toString());
            const isNhan = myAccNums.includes(tx.tK_Dich?.toString());
            const sotien = tx.soTien || 0;
            
            if (tx.loaiGD === "NapTien") {
                inflowData[mIdx] += sotien;
            } else if (tx.loaiGD === "ChuyenTien") {
                if (isNguon && !isNhan) {
                    outflowData[mIdx] += sotien;
                } else if (!isNguon && isNhan) {
                    inflowData[mIdx] += sotien;
                }
            } else {
                // MoSoTietKiem or other
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
                    labels: { color: textColor, font: { family: 'Poppins', size: 11 } }
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
                    ticks: { color: textColor, font: { family: 'Poppins', size: 10 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { family: 'Poppins', size: 10 },
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
        listContainer.innerHTML = `<div style="text-align: center; color: #888888; padding: 20px;">Không có giao dịch gần đây.</div>`;
        return;
    }

    // Save globally so modal can access it
    window.allTransactions = transactions;

    const sorted = [...transactions]
        .sort((a, b) => new Date(b.thoiGianGD) - new Date(a.thoiGianGD))
        .slice(0, 5);

    const myAccNums = myAccounts ? myAccounts.map(a => a.soTaiKhoan.toString()) : [];

    let tableHtml = `
        <div class="fintech-table-container overflow-x-auto">
            <table class="fintech-table w-full text-left">
                <thead>
                    <tr class="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th class="pb-2">Mã GD</th>
                        <th class="pb-2">Chi tiết</th>
                        <th class="pb-2 text-right">Số tiền</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 dark:divide-slate-850">
    `;

    sorted.forEach(tx => {
        const dateStr = new Date(tx.thoiGianGD).toLocaleDateString("vi-VN", {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });

        let amountClass = "";
        let amountPrefix = "";
        let description = "";

        const sotien = tx.soTien || 0;

        const isNguonCuaToi = myAccNums.includes(tx.tK_Nguon?.toString());
        const isNhanCuaToi = myAccNums.includes(tx.tK_Dich?.toString());

        if (tx.loaiGD === "NapTien") {
            amountClass = "plus text-emerald-600 dark:text-emerald-450";
            amountPrefix = "+";
            description = tx.noiDung || `Nạp tiền vào TK ${tx.tK_Dich}`;
        } else if (tx.loaiGD === "ChuyenTien") {
            if (isNguonCuaToi && isNhanCuaToi) {
                amountClass = "text-slate-650 dark:text-slate-450";
                amountPrefix = "";
                description = `Chuyển khoản nội bộ`;
            } else if (isNguonCuaToi) {
                amountClass = "minus text-rose-600 dark:text-rose-450";
                amountPrefix = "-";
                description = tx.noiDung || `Chuyển đến TK ${tx.tK_Dich}`;
            } else if (isNhanCuaToi) {
                amountClass = "plus text-emerald-600 dark:text-emerald-450";
                amountPrefix = "+";
                description = tx.noiDung || `Nhận từ TK ${tx.tK_Nguon}`;
            } else {
                amountClass = "plus text-emerald-600 dark:text-emerald-450";
                amountPrefix = "";
                description = tx.noiDung || "Giao dịch phát sinh";
            }
        } else {
            amountClass = "minus text-rose-600 dark:text-rose-450";
            amountPrefix = "-";
            description = tx.noiDung || `Mở sổ TK từ TK ${tx.tK_Nguon}`;
        }

        tableHtml += `
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer" onclick="openTxDetailModal(${tx.maGD})">
                <td class="py-2.5 font-bold font-mono text-[12px] text-brand-850 dark:text-secondary-400">${tx.maGD}</td>
                <td class="py-2.5">
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">${description}</div>
                    <div class="text-[9px] text-slate-450 mt-0.5">${dateStr}</div>
                </td>
                <td class="py-2.5 text-right font-extrabold text-[12px] ${amountClass}">
                    ${amountPrefix}${formatVND(sotien)}
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

// Modal Chi Tiết Giao Dịch
function openTxDetailModal(txId) {
    const modal = document.getElementById("txDetailModal");
    const container = document.getElementById("txDetailContent");
    if (!modal || !container) return;

    const sourceList = user.role === "Admin" ? allSystemTransactions : (window.allTransactions || []);
    const tx = sourceList.find(t => t.maGD === txId);
    if (!tx) return;

    const dateStr = new Date(tx.thoiGianGD).toLocaleString("vi-VN");
    const statusText = tx.trangThai === "ThanhCong" || tx.trangThai === "Success" ? "Thành công" : "Thất bại";
    const statusColor = tx.trangThai === "ThanhCong" || tx.trangThai === "Success" ? "text-emerald-600 dark:text-emerald-450" : "text-rose-600 dark:text-rose-400";
    
    const loaiGDText = tx.loaiGD === "ChuyenTien" ? "Chuyển khoản liên ngân hàng 24/7" :
                       tx.loaiGD === "NapTien" ? "Nạp tiền vào tài khoản" :
                       tx.loaiGD === "MoSoTietKiem" ? "Mở tài khoản tiết kiệm" :
                       tx.loaiGD === "TatToanTietKiem" ? "Tất toán sổ tiết kiệm" : tx.loaiGD;

    container.innerHTML = `
        <div class="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span class="text-slate-400">Mã giao dịch</span>
            <span class="font-mono font-bold text-slate-800 dark:text-white">${tx.maGD}</span>
        </div>
        <div class="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span class="text-slate-400">Loại giao dịch</span>
            <span class="font-bold text-slate-850 dark:text-slate-200">${loaiGDText}</span>
        </div>
        <div class="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span class="text-slate-400">Tài khoản nguồn</span>
            <span class="font-mono text-slate-800 dark:text-white font-bold">${tx.tK_Nguon || "Hệ thống"}</span>
        </div>
        <div class="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span class="text-slate-400">Tài khoản thụ hưởng</span>
            <span class="font-mono text-slate-800 dark:text-white font-bold">${tx.tK_Dich || "Hệ thống"}</span>
        </div>
        <div class="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span class="text-slate-400">Số tiền</span>
            <span class="font-extrabold text-slate-900 dark:text-white text-sm">${formatVND(tx.soTien)}</span>
        </div>
        <div class="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span class="text-slate-400">Thời gian GD</span>
            <span class="text-slate-800 dark:text-slate-200">${dateStr}</span>
        </div>
        <div class="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span class="text-slate-400">Trạng thái</span>
            <span class="font-bold ${statusColor}">${statusText}</span>
        </div>
        <div class="flex flex-col gap-1.5 pt-1">
            <span class="text-slate-400 block">Nội dung chuyển khoản</span>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl italic font-medium text-slate-650 dark:text-slate-300">
                ${tx.noiDung || "Không có nội dung"}
            </div>
        </div>
    `;

    modal.classList.remove("pointer-events-none", "opacity-0");
    modal.querySelector(".scale-95")?.classList.remove("scale-95");
}

function closeTxDetailModal() {
    const modal = document.getElementById("txDetailModal");
    if (!modal) return;
    modal.classList.add("pointer-events-none", "opacity-0");
    modal.querySelector(".transform")?.classList.add("scale-95");
}

// Modal Cấu Hình Lãi Suất
function openInterestModal() {
    const modal = document.getElementById("interestModal");
    if (!modal) return;
    modal.classList.remove("pointer-events-none", "opacity-0");
    modal.querySelector(".scale-95")?.classList.remove("scale-95");
}

// Close Interest Rate modal
function closeInterestModal() {
    const modal = document.getElementById("interestModal");
    if (!modal) return;
    modal.classList.add("pointer-events-none", "opacity-0");
    modal.querySelector(".transform")?.classList.add("scale-95");
}

function saveInterestRates() {
    closeInterestModal();
    showToastNotification("Cập nhật lãi suất hệ thống thành công!", "success");
    addAuditLog(`Admin ${user.hoTen} updated interest rates: Demand: ${document.getElementById('rateVal0').innerText}, 1M: ${document.getElementById('rateVal1').innerText}, 6M: ${document.getElementById('rateVal6').innerText}, 12M: ${document.getElementById('rateVal12').innerText}`);
}

// Toast notification helper
function showToastNotification(msg, type = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `px-5 py-3 rounded-2xl shadow-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transform translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto ${type === 'success' ? 'bg-emerald-600' : 'bg-red-650'}`;
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
        <span>${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove("translate-y-10", "opacity-0");
    }, 10);
    setTimeout(() => {
        toast.classList.add("translate-y-10", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Simulated background Audit Logs
let auditLogsList = [];
let logsInterval = null;

function initAuditLogs() {
    if (auditLogsList.length === 0) {
        auditLogsList = [
            `[DB] Core-bank SQL Server initialized connection pool. Uptime 99.98%`,
            `[JWT] Validated master security keys. SSL 256-bit encryption active`,
            `[API] Middleware audit logs listener registered successfully`,
            `[AUTH] Admin session started for ${user.hoTen} from host 192.168.1.100`,
            `[CRON] Savings interest rate calculator run completed: 0 rows modified`,
            `[DB] Query: SELECT COUNT(*) FROM KhachHang -> Result: ${allSystemCustomers.length}`,
            `[DB] Query: SELECT SUM(SoDu) FROM TaiKhoan -> Result: ${allSystemAccounts.reduce((s,a)=>s+(a.soDu||0),0)} ₫`
        ];
    }
    
    if (!logsInterval) {
        logsInterval = setInterval(() => {
            if (user.role !== "Admin") return;
            const actions = [
                "[TRANS] Checked OTP state for pending transaction",
                "[SECURITY] Verified SSL certificate handshake on port 443",
                "[DB] Keep-alive transaction probe succeeded",
                `[API] GET /api/transactions — Admin queried system audit records`,
                "[SECURITY] Background integrity check completed: 0 threats",
                `[DB] Cache sync: Refresh accounts table state (${allSystemAccounts.length} CIF records)`
            ];
            const randAction = actions[Math.floor(Math.random() * actions.length)];
            const time = new Date().toLocaleTimeString("vi-VN");
            addAuditLog(`${time} ${randAction}`);
        }, 15000);
    }
}

function openLogsModal() {
    const modal = document.getElementById("logsModal");
    if (!modal) return;
    
    const container = document.getElementById("logsContent");
    if (container) {
        container.innerHTML = auditLogsList.map(log => `<div class="py-0.5 border-b border-slate-900/40">${log}</div>`).join("");
        container.scrollTop = container.scrollHeight;
    }
    
    modal.classList.remove("pointer-events-none", "opacity-0");
    modal.querySelector(".scale-95")?.classList.remove("scale-95");
}

function closeLogsModal() {
    const modal = document.getElementById("logsModal");
    if (!modal) return;
    modal.classList.add("pointer-events-none", "opacity-0");
    modal.querySelector(".transform")?.classList.add("scale-95");
}

function addAuditLog(msg) {
    const time = new Date().toLocaleTimeString("vi-VN");
    const formatted = `[${time}] ${msg}`;
    auditLogsList.push(formatted);
    if (auditLogsList.length > 100) auditLogsList.shift();
    
    const container = document.getElementById("logsContent");
    if (container && modalIsOpen("logsModal")) {
        const div = document.createElement("div");
        div.className = "py-0.5 border-b border-slate-900/40";
        div.innerText = formatted;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}

function modalIsOpen(id) {
    const modal = document.getElementById(id);
    return modal && !modal.classList.contains("opacity-0");
}

function clearAuditLogs() {
    auditLogsList = [`[INFO] Screen logs cleared by admin.`];
    const container = document.getElementById("logsContent");
    if (container) container.innerHTML = `<div class="py-0.5 border-b border-slate-900/40">[INFO] Screen logs cleared by admin.</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!user) return;

    if (user.role !== "Admin") {
        const navCustomers = document.getElementById("navCustomers");
        if (navCustomers) {
            navCustomers.style.display = "none";
        }
    }

    loadDashboardData();
    setupVirtualCard3DEffect();
    
    setInterval(() => {
        loadDashboardData();
    }, 30000);
});