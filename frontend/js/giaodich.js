let allTransactions = [];
let userAccounts = [];

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

async function loadTransactions() {
    const tableBody = document.getElementById("transactionsTableBody");
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-500 dark:text-slate-400 font-semibold italic">Đang đồng bộ dữ liệu giao dịch...</td></tr>';

    try {
        // Tải danh sách tài khoản để phân biệt cộng/trừ tiền đối với User
        const resAccounts = await apiGet("accounts");
        userAccounts = resAccounts.data || [];

        // Nếu là User, hiển thị bộ lọc tài khoản cá nhân và cấu hình options
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.role !== "Admin") {
            const filterAccountGroup = document.getElementById("filterUserAccountGroup");
            const filterAccountSelect = document.getElementById("filterAccount");
            
            if (filterAccountGroup && filterAccountSelect) {
                filterAccountGroup.style.display = "flex";
                filterAccountSelect.innerHTML = '<option value="ALL">-- Tất cả tài khoản --</option>';
                userAccounts.forEach(acc => {
                    const opt = document.createElement("option");
                    opt.value = acc.soTaiKhoan;
                    opt.innerText = acc.soTaiKhoan;
                    filterAccountSelect.appendChild(opt);
                });
            }
        }

        // Tải giao dịch dựa trên Role
        let resTransactions;
        if (currentUser && currentUser.role === "Admin") {
            resTransactions = await apiGet("transactions");
        } else {
            resTransactions = await apiGet("transactions/my");
        }

        allTransactions = resTransactions.data || [];
        
        // Sắp xếp giao dịch mới nhất lên đầu
        allTransactions.sort((a, b) => new Date(b.thoiGianGD) - new Date(a.thoiGianGD));

        renderTable(allTransactions);

    } catch (error) {
        console.error("Lỗi khi tải lịch sử giao dịch:", error);
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-rose-600 dark:text-rose-450 font-bold">Lỗi: ${error.message || "Không thể tải dữ liệu."}</td></tr>`;
    }
}

function renderTable(transactions) {
    const tableBody = document.getElementById("transactionsTableBody");
    tableBody.innerHTML = "";

    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-500 dark:text-slate-400 font-medium italic">Không tìm thấy lịch sử giao dịch nào phù hợp.</td></tr>';
        return;
    }

    const myAccountNumbers = userAccounts.map(a => a.soTaiKhoan);
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === "Admin";

    transactions.forEach(tx => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors";

        // Mã GD
        const tdMaGD = document.createElement("td");
        tdMaGD.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle font-bold text-slate-900 dark:text-white font-mono";
        tdMaGD.innerText = tx.maGD;
        tr.appendChild(tdMaGD);

        // TK Nguồn
        const tdNguon = document.createElement("td");
        tdNguon.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle font-mono text-slate-700 dark:text-slate-300";
        tdNguon.innerText = tx.tK_Nguon || "-";
        tr.appendChild(tdNguon);

        // TK Đích
        const tdDich = document.createElement("td");
        tdDich.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle font-mono text-slate-700 dark:text-slate-300";
        tdDich.innerText = tx.tK_Dich || "-";
        tr.appendChild(tdDich);

        // Số tiền (cộng/trừ thông minh đối với User)
        const tdSoTien = document.createElement("td");
        tdSoTien.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle font-bold text-slate-900 dark:text-white";
        if (isAdmin) {
            tdSoTien.innerText = formatVND(tx.soTien);
        } else {
            const isDestinationMyAccount = myAccountNumbers.includes(tx.tK_Dich);
            const isSourceMyAccount = myAccountNumbers.includes(tx.tK_Nguon);

            if (isDestinationMyAccount && !isSourceMyAccount) {
                // Nhận tiền
                tdSoTien.innerText = "+" + formatVND(tx.soTien);
                tdSoTien.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle font-bold text-emerald-600 dark:text-emerald-400";
            } else if (isSourceMyAccount && !isDestinationMyAccount) {
                // Chuyển tiền đi
                tdSoTien.innerText = "-" + formatVND(tx.soTien);
                tdSoTien.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle font-bold text-rose-600 dark:text-rose-400";
            } else if (isSourceMyAccount && isDestinationMyAccount) {
                // Chuyển nội bộ giữa các tài khoản của chính mình
                tdSoTien.innerText = formatVND(tx.soTien);
                tdSoTien.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle font-bold text-slate-600 dark:text-slate-400";
            } else {
                tdSoTien.innerText = formatVND(tx.soTien);
            }
        }
        tr.appendChild(tdSoTien);

        // Thời gian
        const tdThoiGian = document.createElement("td");
        tdThoiGian.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle text-xs text-slate-500 dark:text-slate-400";
        tdThoiGian.innerText = new Date(tx.thoiGianGD).toLocaleString("vi-VN");
        tr.appendChild(tdThoiGian);

        // Loại GD
        const tdLoai = document.createElement("td");
        tdLoai.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle";
        const badgeSpan = document.createElement("span");
        badgeSpan.className = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold";
        
        switch (tx.loaiGD) {
            case "ChuyenTien":
                badgeSpan.classList.add("bg-blue-500/10", "text-blue-600", "dark:text-blue-400");
                badgeSpan.innerText = "Chuyển khoản";
                break;
            case "MoSoTietKiem":
                badgeSpan.classList.add("bg-amber-500/10", "text-amber-600", "dark:text-amber-400");
                badgeSpan.innerText = "Mở tiết kiệm";
                break;
            case "TatToanTietKiem":
                badgeSpan.classList.add("bg-purple-500/10", "text-purple-600", "dark:text-purple-400");
                badgeSpan.innerText = "Tất toán";
                break;
            case "NapTien":
                badgeSpan.classList.add("bg-emerald-500/10", "text-emerald-600", "dark:text-emerald-400");
                badgeSpan.innerText = "Nạp tiền";
                break;
            default:
                badgeSpan.classList.add("bg-slate-500/10", "text-slate-600", "dark:text-slate-400");
                badgeSpan.innerText = tx.loaiGD || "Khác";
                break;
        }
        tdLoai.appendChild(badgeSpan);
        tr.appendChild(tdLoai);

        // Nội dung
        const tdNoiDung = document.createElement("td");
        tdNoiDung.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle text-slate-600 dark:text-slate-350 max-w-[200px] truncate";
        tdNoiDung.innerText = tx.noiDung || "";
        tr.appendChild(tdNoiDung);

        // Trạng thái
        const tdTrangThai = document.createElement("td");
        tdTrangThai.className = "px-6 py-4 border-b border-slate-150 dark:border-slate-800/60 align-middle";
        const statusSpan = document.createElement("span");
        statusSpan.className = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold";
        
        if (tx.trangThai === "ThanhCong" || tx.trangThai === "Success") {
            statusSpan.innerText = "Thành công";
            statusSpan.classList.add("bg-emerald-500/10", "text-emerald-600", "dark:text-emerald-400");
        } else {
            statusSpan.innerText = tx.trangThai || "Thất bại";
            statusSpan.classList.add("bg-rose-500/10", "text-rose-600", "dark:text-rose-400");
        }
        tdTrangThai.appendChild(statusSpan);
        tr.appendChild(tdTrangThai);

        tableBody.appendChild(tr);
    });
}

function filterTransactions() {
    const filterType = document.getElementById("filterType").value;
    const filterAccountSelect = document.getElementById("filterAccount");
    const filterAccount = filterAccountSelect ? filterAccountSelect.value : "ALL";

    let filtered = allTransactions;

    // Lọc theo Loại GD
    if (filterType !== "ALL") {
        filtered = filtered.filter(tx => tx.loaiGD === filterType);
    }

    // Lọc theo Tài khoản (nếu có)
    if (filterAccount !== "ALL") {
        filtered = filtered.filter(tx => tx.tK_Nguon === filterAccount || tx.tK_Dich === filterAccount);
    }

    renderTable(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
    loadTransactions();
});
