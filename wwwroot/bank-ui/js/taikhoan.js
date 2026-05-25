// Quản lý Tài khoản - GT Smart Bank
// Tích hợp API chuẩn RESTful và phân quyền Admin/User

let allAccounts = [];
const currentUser = getCurrentUser();
const isAdmin = currentUser && currentUser.role === "Admin";

document.addEventListener("DOMContentLoaded", () => {
    initPage();
});

// Khởi tạo trang dựa trên quyền truy cập
function initPage() {
    const accountLayout = document.getElementById("accountLayout");
    const adminFormBox = document.getElementById("adminFormBox");
    const thActions = document.getElementById("thActions");

    if (isAdmin) {
        // Cấu hình UI cho Admin
        if (adminFormBox) adminFormBox.style.display = "block";
        if (accountLayout) accountLayout.classList.remove("full-width");
        if (thActions) thActions.style.display = "";
        
        // Tải dữ liệu bổ trợ cho Dropdown Form
        loadCustomersForDropdown();
        loadBranchesForDropdown();
    } else {
        // Cấu hình UI cho User thường
        if (adminFormBox) adminFormBox.style.display = "none";
        if (accountLayout) accountLayout.classList.add("full-width");
        if (thActions) thActions.style.display = "none";

        // Thay đổi tiêu đề trang cho khách hàng
        document.getElementById("pageTitle").innerText = "Tài khoản của tôi";
        document.getElementById("pageSubtitle").innerText = "Danh sách các tài khoản thanh toán cá nhân đang hoạt động";
    }

    loadAccounts();
}

// Tải danh sách tài khoản từ API
async function loadAccounts() {
    const tbody = document.getElementById("taiKhoanBody");
    const colspan = isAdmin ? 8 : 7;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic">Đang tải danh sách tài khoản...</td></tr>`;

    try {
        const response = await apiGet("accounts");
        if (response && response.success) {
            allAccounts = response.data || [];
            renderAccounts(allAccounts);
        } else {
            tbody.innerHTML = `<tr><td colspan="${colspan}" class="px-6 py-8 text-center text-rose-500 font-medium">Lỗi: ${response.message || 'Không thể tải danh sách tài khoản'}</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="px-6 py-8 text-center text-rose-500 font-medium">Lỗi kết nối API: ${error.message}</td></tr>`;
    }
}

// Render danh sách tài khoản lên bảng
function renderAccounts(accounts) {
    const tbody = document.getElementById("taiKhoanBody");
    const colspan = isAdmin ? 8 : 7;

    if (accounts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Không có tài khoản nào được hiển thị.</td></tr>`;
        return;
    }

    tbody.innerHTML = accounts.map(x => {
        const number = x.soTaiKhoan || x.SoTaiKhoan;
        const khId = x.maKH || x.MaKH;
        const khName = x.tenKhachHang || x.TenKhachHang || `Khách hàng #${khId}`;
        const cnId = x.maCN || x.MaCN;
        const cnName = x.tenChiNhanh || x.TenChiNhanh || `Chi nhánh #${cnId}`;
        const type = x.loaiTaiKhoan || x.LoaiTaiKhoan || 'Thanh toán';
        const balance = x.soDu !== undefined ? x.soDu : x.SoDu;
        const dateStr = x.ngayMoTK || x.NgayMoTK;
        const active = x.trangThai !== undefined ? x.trangThai : x.TrangThai;

        const statusClass = active 
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/30 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-800/30" 
            : "bg-rose-50 text-rose-700 dark:bg-rose-955/30 dark:text-rose-450 border border-rose-200/50 dark:border-rose-800/30";
        const statusText = active ? "Hoạt động" : "Bị khóa";
        const formattedBalance = Number(balance).toLocaleString("vi-VN") + " đ";
        
        let dateFormatted = "N/A";
        if (dateStr) {
            try {
                const date = new Date(dateStr);
                dateFormatted = date.toLocaleDateString("vi-VN");
            } catch(e) {}
        }

        let actionCellHtml = "";
        if (isAdmin) {
            actionCellHtml = `
                <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-2">
                        <button class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-colors" onclick="setupEditAccount('${number}', ${khId}, ${cnId}, '${type}', ${balance}, ${active})">📝 Sửa</button>
                        <button class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-colors" onclick="deleteAccount('${number}')">🗑️ Xóa</button>
                    </div>
                </td>
            `;
        }

        return `
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                <td class="px-6 py-4 font-mono font-bold text-slate-800 dark:text-white text-base">${number}</td>
                <td class="px-6 py-4">
                    <span class="font-bold text-slate-800 dark:text-slate-100">${khName}</span>
                    <div class="text-[11px] text-slate-400 dark:text-slate-550 font-medium">Mã KH: #${khId}</div>
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-350 font-medium">🏢 ${cnName}</td>
                <td class="px-6 py-4"><span class="text-xs font-bold text-slate-500 dark:text-slate-400">${type}</span></td>
                <td class="px-6 py-4"><span class="font-extrabold text-emerald-600 dark:text-emerald-450">${formattedBalance}</span></td>
                <td class="px-6 py-4 text-xs font-semibold text-slate-550 dark:text-slate-400">${dateFormatted}</td>
                <td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusClass}">${statusText}</span></td>
                ${actionCellHtml}
            </tr>
        `;
    }).join("");
}

// Tìm kiếm tài khoản trên giao diện Client
function filterAccounts() {
    const keyword = document.getElementById("searchKeyword").value.trim().toLowerCase();
    if (!keyword) {
        renderAccounts(allAccounts);
        return;
    }

    const filtered = allAccounts.filter(x => {
        const number = (x.soTaiKhoan || x.SoTaiKhoan || "").toLowerCase();
        const khName = (x.tenKhachHang || x.TenKhachHang || "").toLowerCase();
        const cnName = (x.tenChiNhanh || x.TenChiNhanh || "").toLowerCase();
        
        return number.includes(keyword) || khName.includes(keyword) || cnName.includes(keyword);
    });

    renderAccounts(filtered);
}

// Tải danh sách khách hàng vào Dropdown chọn của Form
async function loadCustomersForDropdown() {
    const dropdown = document.getElementById("accountCustomer");
    try {
        const response = await apiGet("customers");
        if (response && response.success) {
            const list = response.data || [];
            list.forEach(kh => {
                const opt = document.createElement("option");
                opt.value = kh.maKH || kh.MaKH;
                opt.innerText = `${kh.hoTen || kh.HoTen} (SĐT: ${kh.soDienThoai || kh.SoDienThoai})`;
                dropdown.appendChild(opt);
            });
        }
    } catch (error) {
        console.error("Lỗi khi load danh sách khách hàng cho dropdown:", error);
    }
}

// Tải danh sách chi nhánh vào Dropdown chọn của Form
async function loadBranchesForDropdown() {
    const dropdown = document.getElementById("accountBranch");
    try {
        const response = await apiGet("branches");
        if (response && response.success) {
            const list = response.data || [];
            list.forEach(cn => {
                const opt = document.createElement("option");
                opt.value = cn.maCN || cn.MaCN;
                opt.innerText = cn.tenCN || cn.TenCN;
                dropdown.appendChild(opt);
            });
        }
    } catch (error) {
        console.error("Lỗi khi load danh sách chi nhánh cho dropdown:", error);
    }
}

// Lưu thông tin tài khoản (POST mở mới hoặc PUT chỉnh sửa)
async function saveAccount() {
    const isEdit = document.getElementById("isEditMode").value === "true";
    const number = document.getElementById("accountNumber").value.trim();
    const customerId = document.getElementById("accountCustomer").value;
    const branchId = document.getElementById("accountBranch").value;
    const type = document.getElementById("accountType").value;
    const balance = document.getElementById("accountBalance").value;
    const status = document.getElementById("accountStatus").value === "true";

    // Validate form
    if (!number || !customerId || !branchId || !balance) {
        showToast("Vui lòng điền đầy đủ các thông tin bắt buộc.", "warning");
        return;
    }

    if (isNaN(number) || number.length < 6) {
        showToast("Số tài khoản không hợp lệ (phải là số và tối thiểu 6 chữ số).", "warning");
        return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance) || numBalance < 50000) {
        showToast("Số dư ban đầu tối thiểu là 50,000 VNĐ.", "warning");
        return;
    }

    const btnSubmit = document.getElementById("btnSubmitAccount");
    btnSubmit.disabled = true;
    btnSubmit.innerText = isEdit ? "Đang cập nhật..." : "Đang mở tài khoản...";

    const payload = {
        soTaiKhoan: number,
        maKH: parseInt(customerId),
        maCN: parseInt(branchId),
        loaiTaiKhoan: type,
        soDu: numBalance,
        trangThai: status
    };

    try {
        let response;
        if (isEdit) {
            // PUT cập nhật
            response = await apiPut(`accounts/${number}`, payload);
        } else {
            // POST mở mới
            response = await apiPost("accounts", payload);
        }

        if (response && response.success) {
            showToast(response.message || "Lưu thông tin tài khoản thành công!", "success");
            cancelEdit();
            loadAccounts();
        } else {
            showToast(response.message || "Thao tác thất bại.", "error");
        }
    } catch (error) {
        showToast(`Lỗi: ${error.message}`, "error");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = isEdit ? "Cập nhật tài khoản" : "Mở tài khoản";
    }
}

// Chuẩn bị form để chỉnh sửa tài khoản
function setupEditAccount(number, customerId, branchId, type, balance, active) {
    document.getElementById("isEditMode").value = "true";
    
    // Đổ thông tin lên form
    const numberInput = document.getElementById("accountNumber");
    numberInput.value = number;
    numberInput.disabled = true; // Khóa trường số tài khoản khi Edit

    document.getElementById("accountCustomer").value = customerId;
    document.getElementById("accountBranch").value = branchId;
    document.getElementById("accountType").value = type;
    
    const balanceInput = document.getElementById("accountBalance");
    balanceInput.value = balance;
    // Tùy nhu cầu, Admin có thể thay đổi số dư hoặc không, giữ nguyên input

    document.getElementById("accountStatus").value = active.toString();

    // Thay đổi giao diện Form
    document.getElementById("formTitle").innerText = "Chỉnh sửa tài khoản";
    document.getElementById("btnSubmitAccount").innerText = "Cập nhật tài khoản";
    document.getElementById("btnCancelEdit").style.display = "block";

    // Cuộn tới form
    document.getElementById("adminFormBox").scrollIntoView({ behavior: "smooth" });
}

// Hủy chế độ chỉnh sửa, reset form về ban đầu
function cancelEdit() {
    document.getElementById("isEditMode").value = "false";
    
    const numberInput = document.getElementById("accountNumber");
    numberInput.value = "";
    numberInput.disabled = false; // Mở lại input số tài khoản

    document.getElementById("accountCustomer").value = "";
    document.getElementById("accountBranch").value = "";
    document.getElementById("accountType").value = "Thanh toán";
    
    const balanceInput = document.getElementById("accountBalance");
    balanceInput.value = "50000";

    document.getElementById("accountStatus").value = "true";

    document.getElementById("formTitle").innerText = "Mở tài khoản thanh toán";
    document.getElementById("btnSubmitAccount").innerText = "Mở tài khoản";
    document.getElementById("btnCancelEdit").style.display = "none";
}

// Xóa tài khoản thanh toán
async function deleteAccount(number) {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${number}?\nMọi giao dịch chuyển tiền liên quan đến số tài khoản này có thể bị ảnh hưởng!`)) {
        return;
    }

    try {
        const response = await apiDelete(`accounts/${number}`);
        if (response && response.success) {
            showToast(response.message || "Xóa tài khoản thành công!", "success");
            loadAccounts();
            
            // Nếu đang sửa chính tài khoản vừa bị xóa, reset form
            if (document.getElementById("isEditMode").value === "true" && 
                document.getElementById("accountNumber").value === number) {
                cancelEdit();
            }
        } else {
            showToast(response.message || "Xóa thất bại.", "error");
        }
    } catch (error) {
        showToast(`Lỗi khi xóa tài khoản: ${error.message}`, "error");
    }
}