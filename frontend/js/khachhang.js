// Quản lý Khách hàng - GT Smart Bank
// Tích hợp API chuẩn RESTful và bảo mật JWT

let allCustomers = [];

document.addEventListener("DOMContentLoaded", () => {
    loadCustomers();
});

// Tải danh sách khách hàng từ API
async function loadCustomers() {
    const tbody = document.getElementById("khachHangBody");
    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic">Đang tải danh sách khách hàng...</td></tr>';

    try {
        const response = await apiGet("customers");
        if (response && response.success) {
            allCustomers = response.data || [];
            renderCustomers(allCustomers);
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-rose-500 font-medium">Lỗi: ${response.message || 'Không thể tải danh sách'}</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-rose-500 font-medium">Lỗi kết nối API: ${error.message}</td></tr>`;
    }
}

// Render dữ liệu khách hàng lên bảng
function renderCustomers(customers) {
    const tbody = document.getElementById("khachHangBody");
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Không tìm thấy khách hàng nào.</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(x => {
        const id = x.maKH || x.MaKH;
        const name = x.hoTen || x.HoTen;
        const cccd = x.cccd || x.CCCD;
        const phone = x.soDienThoai || x.SoDienThoai;
        const email = x.email || x.Email || 'Chưa cập nhật';
        const address = x.diaChi || x.DiaChi || 'Chưa cập nhật';
        const role = x.role || x.Role || 'User';
        const active = x.trangThai !== undefined ? x.trangThai : x.TrangThai;

        const roleClass = role === "Admin" 
            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/30" 
            : "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border border-slate-200/20 dark:border-slate-700/20";
        const roleText = role === "Admin" ? "Admin" : "Khách hàng";
        
        const statusClass = active 
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30" 
            : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30";
        const statusText = active ? "Hoạt động" : "Bị khóa";

        return `
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                <td class="px-6 py-4 font-mono font-bold text-slate-400 dark:text-slate-500">#${id}</td>
                <td class="px-6 py-4 font-bold text-slate-800 dark:text-white">${name}</td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-350">
                    <div class="font-semibold flex items-center gap-1">
                        <span class="text-slate-400">📞</span> ${phone}
                    </div>
                    <div class="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <span>🪪</span> CCCD: ${cccd}
                    </div>
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-350">
                    <div class="text-xs font-semibold flex items-center gap-1">
                        <span class="text-slate-400">📧</span> ${email}
                    </div>
                    <div class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] truncate flex items-center gap-1" title="${address}">
                        <span>📍</span> ${address}
                    </div>
                </td>
                <td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${roleClass}">${roleText}</span></td>
                <td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusClass}">${statusText}</span></td>
                <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-2">
                        <button class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-colors" onclick="setupEditCustomer(${id}, '${name.replace(/'/g, "\\'")}', '${cccd}', '${phone}', '${email.replace(/'/g, "\\'")}', '${address.replace(/'/g, "\\'")}', '${role}', ${active})">📝 Sửa</button>
                        <button class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-colors" onclick="deleteCustomer(${id})">🗑️ Xóa</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// Lọc khách hàng ngay trên client khi gõ tìm kiếm
function filterCustomers() {
    const keyword = document.getElementById("searchKeyword").value.trim().toLowerCase();
    if (!keyword) {
        renderCustomers(allCustomers);
        return;
    }

    const filtered = allCustomers.filter(x => {
        const name = (x.hoTen || x.HoTen || "").toLowerCase();
        const phone = (x.soDienThoai || x.SoDienThoai || "").toLowerCase();
        const cccd = (x.cccd || x.CCCD || "").toLowerCase();
        
        return name.includes(keyword) || phone.includes(keyword) || cccd.includes(keyword);
    });

    renderCustomers(filtered);
}

// Lưu khách hàng (Thêm mới hoặc Cập nhật)
async function saveCustomer() {
    const id = document.getElementById("editCustomerId").value;
    const name = document.getElementById("customerName").value.trim();
    const cccd = document.getElementById("customerCccd").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const password = document.getElementById("customerPassword").value;
    const role = document.getElementById("customerRole").value;
    const status = document.getElementById("customerStatus").value === "true";

    // Validate dữ liệu đầu vào
    if (!name || !cccd || !phone) {
        showToast("Vui lòng điền các trường bắt buộc: Họ tên, Số CCCD, Số điện thoại.", "warning");
        return;
    }

    if (cccd.length !== 12 || isNaN(cccd)) {
        showToast("Số CCCD không hợp lệ (yêu cầu đúng 12 chữ số).", "warning");
        return;
    }

    // Nếu thêm mới, yêu cầu nhập mật khẩu
    if (!id && !password) {
        showToast("Vui lòng nhập mật khẩu khởi tạo cho khách hàng mới.", "warning");
        return;
    }

    const btnSubmit = document.getElementById("btnSubmitCustomer");
    btnSubmit.disabled = true;
    btnSubmit.innerText = id ? "Đang cập nhật..." : "Đang tạo mới...";

    const payload = {
        hoTen: name,
        cccd: cccd,
        soDienThoai: phone,
        email: email || null,
        diaChi: address || null,
        matKhauHash: password || "", // Gửi text thô, Backend Service tự băm
        role: role,
        trangThai: status
    };

    if (id) {
        payload.maKH = parseInt(id);
    }

    try {
        let response;
        if (id) {
            // PUT cập nhật
            response = await apiPut(`customers/${id}`, payload);
        } else {
            // POST thêm mới
            response = await apiPost("customers", payload);
        }

        if (response && response.success) {
            showToast(response.message || "Lưu thông tin khách hàng thành công!", "success");
            cancelEdit();
            loadCustomers();
        } else {
            showToast(response.message || "Lưu thông tin thất bại.", "error");
        }
    } catch (error) {
        showToast(`Lỗi khi lưu dữ liệu khách hàng: ${error.message}`, "error");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = id ? "Cập nhật thông tin" : "Thêm khách hàng";
    }
}

// Chuẩn bị form để sửa khách hàng
function setupEditCustomer(id, name, cccd, phone, email, address, role, active) {
    document.getElementById("editCustomerId").value = id;
    document.getElementById("customerName").value = name;
    document.getElementById("customerCccd").value = cccd;
    document.getElementById("customerPhone").value = phone;
    document.getElementById("customerEmail").value = email === 'Chưa cập nhật' ? '' : email;
    document.getElementById("customerAddress").value = address === 'Chưa cập nhật' ? '' : address;
    document.getElementById("customerPassword").value = ""; // Để trống mật khẩu
    document.getElementById("customerRole").value = role;
    document.getElementById("customerStatus").value = active.toString();

    // Thay đổi giao diện Form
    document.getElementById("formTitle").innerText = "Chỉnh sửa thông tin khách hàng";
    document.getElementById("btnSubmitCustomer").innerText = "Cập nhật thông tin";
    document.getElementById("passwordHelp").style.display = "block";
    document.getElementById("btnCancelEdit").style.display = "block";

    // Cuộn tới form
    document.querySelector(".form-box").scrollIntoView({ behavior: "smooth" });
}

// Hủy bỏ chế độ chỉnh sửa, reset form về mặc định
function cancelEdit() {
    document.getElementById("editCustomerId").value = "";
    document.getElementById("customerName").value = "";
    document.getElementById("customerCccd").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerEmail").value = "";
    document.getElementById("customerAddress").value = "";
    document.getElementById("customerPassword").value = "";
    document.getElementById("customerRole").value = "User";
    document.getElementById("customerStatus").value = "true";

    document.getElementById("formTitle").innerText = "Thêm khách hàng mới";
    document.getElementById("btnSubmitCustomer").innerText = "Thêm khách hàng";
    document.getElementById("passwordHelp").style.display = "none";
    document.getElementById("btnCancelEdit").style.display = "none";
}

// Xóa khách hàng
async function deleteCustomer(id) {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng #${id}?\nMọi tài khoản ngân hàng và lịch sử liên quan đến khách hàng này cũng có thể bị ảnh hưởng trong database!`)) {
        return;
    }

    try {
        const response = await apiDelete(`customers/${id}`);
        if (response && response.success) {
            showToast(response.message || "Xóa khách hàng thành công!", "success");
            loadCustomers();
            
            // Nếu đang sửa khách hàng bị xóa, hủy chỉnh sửa
            if (document.getElementById("editCustomerId").value == id) {
                cancelEdit();
            }
        } else {
            showToast(response.message || "Xóa thất bại.", "error");
        }
    } catch (error) {
        showToast(`Lỗi khi xóa khách hàng: ${error.message}`, "error");
    }
}