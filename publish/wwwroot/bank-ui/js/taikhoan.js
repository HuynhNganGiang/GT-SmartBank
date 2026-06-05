// Quản lý Tài khoản - GT Smart Bank

let allAccounts = [];

document.addEventListener("DOMContentLoaded", () => {
    loadAccounts();
});

function getValue(obj, ...keys) {
    for (const key of keys) {
        if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return "";
}

function formatVND(value) {
    const number = Number(value || 0);
    return number.toLocaleString("vi-VN") + " đ";
}

async function apiGetFirst(paths) {
    let lastError = null;

    for (const path of paths) {
        try {
            const response = await apiGet(path);
            if (response && response.success !== false) {
                return response;
            }
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Không thể tải dữ liệu.");
}

async function loadAccounts() {
    const tbody = document.getElementById("taiKhoanBody");
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="px-6 py-10 text-center text-slate-500 italic">
                Đang tải danh sách tài khoản...
            </td>
        </tr>
    `;

    try {
        const result = await apiGetFirst([
    "accounts"
]);

allAccounts = Array.isArray(result)
    ? result
    : Array.isArray(result.data)
        ? result.data
        : [];

renderAccounts(allAccounts);
    } catch (error) {
        console.error("Lỗi tải tài khoản:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-10 text-center text-red-600 font-semibold">
                    Không thể tải danh sách tài khoản. Vui lòng kiểm tra API /api/TaiKhoan.
                </td>
            </tr>
        `;
    }
}

function renderAccounts(accounts) {
    const tbody = document.getElementById("taiKhoanBody");
    if (!tbody) return;

    if (!accounts || accounts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-10 text-center text-slate-500">
                    Chưa có tài khoản nào trong hệ thống.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = accounts.map(acc => {
        const soTaiKhoan = getValue(acc, "soTaiKhoan", "SoTaiKhoan");
        const loaiTaiKhoan = getValue(acc, "loaiTaiKhoan", "LoaiTaiKhoan") || "Thanh toán";
        const soDu = getValue(acc, "soDu", "SoDu") || 0;
        const ngayMoTK = getValue(acc, "ngayMoTK", "NgayMoTK");
        const trangThai = getValue(acc, "trangThai", "TrangThai");

        const maKH = getValue(acc, "maKH", "MaKH");
        const maCN = getValue(acc, "maCN", "MaCN");

        const khachHang = getValue(acc, "tenKhachHang", "TenKhachHang", "hoTen", "HoTen") || `Khách hàng #${maKH}`;
        const chiNhanh = getValue(acc, "tenChiNhanh", "TenChiNhanh", "tenCN", "TenCN") || `Chi nhánh #${maCN}`;

        const ngayMo = ngayMoTK ? new Date(ngayMoTK).toLocaleDateString("vi-VN") : "N/A";
        const active = trangThai === true || trangThai === 1 || trangThai === "true" || trangThai === "Hoạt động";

        return `
            <tr class="hover:bg-slate-50 transition">
                <td class="px-6 py-4 font-bold font-mono text-slate-800">${soTaiKhoan}</td>
                <td class="px-6 py-4">
                    <div class="font-bold text-slate-800">${khachHang}</div>
                    <div class="text-xs text-slate-400">Mã KH: ${maKH || "N/A"}</div>
                </td>
                <td class="px-6 py-4 text-slate-600">${chiNhanh}</td>
                <td class="px-6 py-4 font-semibold">${loaiTaiKhoan}</td>
                <td class="px-6 py-4 font-extrabold text-emerald-600">${formatVND(soDu)}</td>
                <td class="px-6 py-4 text-slate-600">${ngayMo}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}">
                        ${active ? "Hoạt động" : "Bị khóa"}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="showToast('Chức năng quản lý tài khoản đang ở chế độ demo', 'info')" 
                            class="px-3 py-2 rounded-lg bg-slate-100 hover:bg-red-700 hover:text-white text-xs font-bold">
                        Xem
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function filterAccounts() {
    const input = document.getElementById("searchKeyword");
    const keyword = input ? input.value.trim().toLowerCase() : "";

    if (!keyword) {
        renderAccounts(allAccounts);
        return;
    }

    const filtered = allAccounts.filter(acc => {
        const text = JSON.stringify(acc).toLowerCase();
        return text.includes(keyword);
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