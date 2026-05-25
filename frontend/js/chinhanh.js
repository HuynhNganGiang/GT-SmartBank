// Quản lý Chi nhánh - GT Smart Bank
// Tích hợp API chuẩn RESTful và phân quyền Admin/User

document.addEventListener("DOMContentLoaded", () => {
    loadBranches();
});

// Tải danh sách chi nhánh từ API
async function loadBranches() {
    const branchGrid = document.getElementById("branchGrid");
    const branchLayout = document.getElementById("branchLayout");
    const adminFormBox = document.getElementById("adminFormBox");
    
    branchGrid.innerHTML = '<p class="text-slate-500 dark:text-slate-400 font-medium italic col-span-full py-4 text-center">Đang tải danh sách chi nhánh...</p>';

    // Phân quyền hiển thị form Admin
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === "Admin";

    if (isAdmin) {
        // Hiển thị form Admin ở bên phải
        if (adminFormBox) adminFormBox.style.display = "block";
        if (branchLayout) branchLayout.classList.remove("full-width");
    } else {
        // Ẩn form Admin đối với User thường, hiển thị danh sách toàn màn hình
        if (adminFormBox) adminFormBox.style.display = "none";
        if (branchLayout) branchLayout.classList.add("full-width");
    }

    try {
        const response = await apiGet("branches");
        if (response && response.success) {
            const branches = response.data || [];
            if (branches.length === 0) {
                branchGrid.innerHTML = '<p class="text-rose-500 font-semibold col-span-full py-4 text-center">Hiện tại chưa có chi nhánh nào hoạt động.</p>';
                return;
            }

            branchGrid.innerHTML = "";
            branches.forEach(branch => {
                const id = branch.maCN || branch.MaCN;
                const name = branch.tenCN || branch.TenCN;
                const address = branch.diaChi || branch.DiaChi;
                
                // Giả lập số điện thoại cố định dựa trên mã chi nhánh cho đẹp giao diện
                const phone = `028.38${(1000 + id).toString().substring(1)}`;

                const card = document.createElement("div");
                card.className = "bg-white dark:bg-slate-900 p-6 rounded-2xl border-t-4 border-emerald-500 dark:border-amber-400 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between";
                
                let adminButtonsHtml = "";
                if (isAdmin) {
                    adminButtonsHtml = `
                        <div class="admin-actions flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                            <button class="flex-1 py-2 px-3 text-xs font-bold rounded-xl text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-slate-950 transition-all duration-200" onclick="editBranch(${id}, '${name.replace(/'/g, "\\'")}', '${address.replace(/'/g, "\\'")}')">📝 Sửa</button>
                            <button class="flex-1 py-2 px-3 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-455 bg-rose-500/10 hover:bg-rose-600 hover:text-white transition-all duration-200" onclick="deleteBranch(${id})">🗑️ Xóa</button>
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div>
                        <h3 class="text-emerald-700 dark:text-amber-400 font-bold text-base mb-3 flex items-center gap-2">🏢 ${name}</h3>
                        <div class="text-xs text-slate-550 dark:text-slate-400 space-y-2 mb-2 font-medium">
                            <div class="flex items-start gap-1"><strong class="text-slate-700 dark:text-slate-350 font-bold flex-shrink-0">📍 Địa chỉ:</strong> <span class="leading-normal">${address}</span></div>
                            <div class="flex items-center gap-1"><strong class="text-slate-700 dark:text-slate-350 font-bold flex-shrink-0">📞 Điện thoại:</strong> <span class="leading-normal">${phone}</span></div>
                        </div>
                    </div>
                    ${adminButtonsHtml}
                `;
                branchGrid.appendChild(card);
            });
        } else {
            branchGrid.innerHTML = `<p class="text-rose-500 font-semibold col-span-full py-4 text-center">Lỗi: ${response.message || 'Không thể tải danh sách chi nhánh.'}</p>`;
        }
    } catch (error) {
        branchGrid.innerHTML = `<p class="text-rose-500 font-semibold col-span-full py-4 text-center">Không thể tải danh sách chi nhánh. Chi tiết: ${error.message}</p>`;
    }
}

// Lưu thông tin chi nhánh (Thêm mới hoặc Cập nhật)
async function saveBranch() {
    const idInput = document.getElementById("editBranchId");
    const nameInput = document.getElementById("branchName");
    const addressInput = document.getElementById("branchAddress");

    const id = idInput.value;
    const name = nameInput.value.trim();
    const address = addressInput.value.trim();

    if (!name || !address) {
        showToast("Vui lòng nhập đầy đủ Tên chi nhánh và Địa chỉ.", "warning");
        return;
    }

    const btnSubmit = document.getElementById("btnSubmitBranch");
    btnSubmit.disabled = true;
    btnSubmit.innerText = id ? "Đang cập nhật..." : "Đang thêm mới...";

    try {
        let response;
        if (id) {
            // Cập nhật chi nhánh (PUT)
            response = await apiPut(`branches/${id}`, {
                maCN: parseInt(id),
                tenCN: name,
                diaChi: address
            });
        } else {
            // Thêm mới chi nhánh (POST)
            response = await apiPost("branches", {
                tenCN: name,
                diaChi: address
            });
        }

        if (response && response.success) {
            showToast(response.message || "Lưu thông tin chi nhánh thành công!", "success");
            cancelEdit();
            loadBranches();
        } else {
            showToast(response.message || "Lưu thất bại.", "error");
        }
    } catch (error) {
        showToast(`Lỗi khi lưu chi nhánh: ${error.message}`, "error");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = id ? "Cập nhật chi nhánh" : "Thêm mới chi nhánh";
    }
}

// Đưa thông tin chi nhánh vào form để chỉnh sửa
function editBranch(id, name, address) {
    document.getElementById("editBranchId").value = id;
    document.getElementById("branchName").value = name;
    document.getElementById("branchAddress").value = address;
    // Bảng ChiNhanh không lưu số điện thoại nên ta bỏ trống hoặc không xử lý trường phone trên form gửi lên

    document.getElementById("formTitle").innerText = "Chỉnh sửa chi nhánh";
    document.getElementById("btnSubmitBranch").innerText = "Cập nhật chi nhánh";
    
    const btnCancel = document.getElementById("btnCancelEdit");
    if (btnCancel) {
        btnCancel.style.display = "block";
    }
    
    // Cuộn nhẹ tới form
    document.getElementById("adminFormBox").scrollIntoView({ behavior: "smooth" });
}

// Hủy bỏ chế độ chỉnh sửa
function cancelEdit() {
    document.getElementById("editBranchId").value = "";
    document.getElementById("branchName").value = "";
    document.getElementById("branchAddress").value = "";
    document.getElementById("branchPhone").value = ""; // Clear giả lập điện thoại trên form nếu có

    document.getElementById("formTitle").innerText = "Thêm chi nhánh mới";
    document.getElementById("btnSubmitBranch").innerText = "Thêm mới chi nhánh";

    const btnCancel = document.getElementById("btnCancelEdit");
    if (btnCancel) {
        btnCancel.style.display = "none";
    }
}

// Xóa chi nhánh
async function deleteBranch(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa chi nhánh này? Thao tác này không thể hoàn tác!")) {
        return;
    }

    try {
        const response = await apiDelete(`branches/${id}`);
        if (response && response.success) {
            showToast(response.message || "Xóa chi nhánh thành công!", "success");
            loadBranches();
            // Nếu đang sửa chi nhánh bị xóa, hãy reset form
            const currentEditId = document.getElementById("editBranchId").value;
            if (currentEditId == id) {
                cancelEdit();
            }
        } else {
            showToast(response.message || "Xóa chi nhánh thất bại.", "error");
        }
    } catch (error) {
        showToast(`Lỗi khi xóa chi nhánh: ${error.message}`, "error");
    }
}
