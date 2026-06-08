// Phân quyền giao diện
var stkCurrentUser = window.currentUser || (typeof getCurrentUser === "function" ? getCurrentUser() : null);
window.currentUser = stkCurrentUser;
var stkIsAdmin = stkCurrentUser?.role === "Admin";
var stkIsStaff = stkCurrentUser?.role === "Staff";
var stkCanManageSavings = stkIsAdmin || stkIsStaff;
function showNoPermission() {
    if (typeof showToast === "function") showToast("Bạn không có quyền thực hiện chức năng này.", "error");
    else alert("Bạn không có quyền thực hiện chức năng này.");
}
function isForbiddenError(error) {
    const msg = String(error?.message || error || "");
    return error?.status === 403 || msg.includes("403") || msg.toLowerCase().includes("forbid");
}
function applySavingsPermissionUI() {
    if (stkCanManageSavings) return;
    const btnOpen = document.querySelector('button[onclick="openSavingsAccount()"]');
    if (btnOpen) { btnOpen.disabled = true; btnOpen.innerText = "Bạn không có quyền mở sổ"; btnOpen.classList.add("opacity-60", "cursor-not-allowed"); }
}

let accounts = [];

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Tải danh sách sổ tiết kiệm
async function loadSavingsAccounts() {
    const grid = document.getElementById("savingsGrid");
    grid.innerHTML = '<p style="color: #666; font-style: italic;">Đang tải danh sách sổ...</p>';

    try {
        const result = await apiGet("savings-accounts");
        const list = result.data || [];

        // Sắp xếp: Sổ hoạt động lên trước, sổ đã tất toán xuống dưới
        list.sort((a, b) => {
            if (a.trangThai === "HoatDong" && b.trangThai !== "HoatDong") return -1;
            if (a.trangThai !== "HoatDong" && b.trangThai === "HoatDong") return 1;
            return new Date(b.ngayMo) - new Date(a.ngayMo);
        });

        grid.innerHTML = "";

        if (list.length === 0) {
            grid.innerHTML = '<p style="color: #666; font-style: italic; grid-column: 1/-1; text-align: center; padding: 30px;">Bạn chưa có sổ tiết kiệm tích lũy nào.</p>';
            return;
        }

        list.forEach(stk => {
            const card = document.createElement("div");
            const isActive = stk.trangThai === "HoatDong";
            card.className = `saving-card relative p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group overflow-hidden border-l-4 ${isActive ? 'border-l-emerald-500' : 'border-l-slate-400 dark:border-l-slate-600 opacity-75'}`;

            // Status Badge
            const badge = document.createElement("span");
            badge.className = `absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`;
            badge.innerText = isActive ? "Hoạt động" : "Đã tất toán";
            card.appendChild(badge);

            // Tên Sổ
            const title = document.createElement("h3");
            title.className = "text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-2";
            title.innerText = `Sổ tiết kiệm #${stk.maSo}`;
            card.appendChild(title);

            // Số tiền gốc
            const amt = document.createElement("div");
            amt.className = "text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-4";
            amt.innerText = formatVND(stk.soTienGoc);
            card.appendChild(amt);

            // Chi tiết
            const details = document.createElement("div");
            details.className = "text-xs space-y-2 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 mb-4 font-semibold";
            
            const ngayMoFormatted = new Date(stk.ngayMo).toLocaleDateString("vi-VN");
            const ngayDaoHanFormatted = stk.ngayDaoHan ? new Date(stk.ngayDaoHan).toLocaleDateString("vi-VN") : "N/A";

           details.innerHTML = `
    <div class="flex justify-between">
        <span>Tài khoản nguồn:</span>
        <span class="font-mono text-slate-800 dark:text-white">${stk.soTaiKhoan}</span>
    </div>

    <div class="flex justify-between">
        <span>Mã KH:</span>
        <span class="text-slate-800 dark:text-white">${stk.maKH ?? '---'}</span>
    </div>

    <div class="flex justify-between">
        <span>Khách hàng:</span>
        <span class="text-slate-800 dark:text-white">${stk.hoTen ?? '---'}</span>
    </div>

    <div class="flex justify-between">
        <span>CCCD:</span>
        <span class="font-mono text-slate-800 dark:text-white">${stk.cccd ?? '---'}</span>
    </div>

    <div class="flex justify-between">
        <span>Kỳ hạn:</span>
        <span class="text-slate-800 dark:text-white">${stk.kyHan} tháng</span>
    </div>

    <div class="flex justify-between">
        <span>Lãi suất:</span>
        <span class="text-amber-500 dark:text-amber-400 font-extrabold">${stk.laiSuat}% / năm</span>
    </div>

    <div class="flex justify-between">
        <span>Ngày mở sổ:</span>
        <span class="text-slate-800 dark:text-white">${ngayMoFormatted}</span>
    </div>

    <div class="flex justify-between">
        <span>${isActive ? 'Ngày đáo hạn' : 'Ngày tất toán'}:</span>
        <span class="text-slate-850 dark:text-slate-200">${ngayDaoHanFormatted}</span>
    </div>
`;
            card.appendChild(details);

            // Nút tất toán (chỉ hiển thị nếu sổ đang hoạt động)
            if (isActive && stkCanManageSavings) {
                const btn = document.createElement("button");
                btn.className = "w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-300 mt-2";
                btn.innerText = "Tất toán ngay";
                btn.onclick = () => settleSavingsAccount(stk.maSo);
                card.appendChild(btn);
            }

            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Lỗi khi load danh sách sổ tiết kiệm:", error);
        grid.innerHTML = `<p style="color: #c62828; font-weight: bold;">Lỗi: ${error.message}</p>`;
    }
}

// Tải danh sách tài khoản thanh toán trích nợ
async function loadAccounts() {
    try {
        const result = await apiGet("accounts");
        accounts = result.data || [];
        
        const tkNguonSelect = document.getElementById("tkNguon");
        tkNguonSelect.innerHTML = '<option value="">-- Chọn tài khoản thanh toán --</option>';
        
        accounts.forEach(acc => {
            if (acc.trangThai) {
                const option = document.createElement("option");
                option.value = acc.soTaiKhoan;
                option.innerText = `${acc.soTaiKhoan} - ${acc.loaiTaiKhoan} (${formatVND(acc.soDu)})`;
                tkNguonSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Không tải được tài khoản trích tiền:", error);
    }
}

// Cập nhật số dư tài khoản trích nợ được chọn
function updateBalanceInfo() {
    const tkNguon = document.getElementById("tkNguon").value;
    const balanceP = document.getElementById("tkNguonBalance");
    
    if (!tkNguon) {
        balanceP.innerText = "";
        return;
    }
    
    const acc = accounts.find(a => a.soTaiKhoan === tkNguon);
    if (acc) {
        balanceP.innerText = `Số dư khả dụng: ${formatVND(acc.soDu)}`;
    }
    updateInterestRate();
}

// Format hiển thị số tiền gửi phân cách hàng nghìn
function formatTienWord() {
    const soTien = parseFloat(document.getElementById("soTienGoc").value);
    const textP = document.getElementById("soTienChu");
    
    if (isNaN(soTien) || soTien <= 0) {
        textP.innerText = "";
        return;
    }
    
    textP.innerText = `Số tiền gửi: ${formatVND(soTien)}`;
    updateInterestRate();
}

// Tự động tính lãi suất và tiền lãi dự kiến nhận được khi đáo hạn
function updateInterestRate() {
    const soTienVal = parseFloat(document.getElementById("soTienGoc").value);
    const kyHanVal = parseInt(document.getElementById("kyHan").value);
    const infoBox = document.getElementById("interestInfoBox");
    const rateSpan = document.getElementById("projectedRate");
    const interestSpan = document.getElementById("projectedInterest");

    if (isNaN(soTienVal) || soTienVal <= 0 || isNaN(kyHanVal) || !kyHanVal) {
        infoBox.style.display = "none";
        return;
    }

    let laiSuat = 0;
    switch (kyHanVal) {
        case 1: laiSuat = 3.0; break;
        case 3: laiSuat = 3.5; break;
        case 6: laiSuat = 4.5; break;
        case 12: laiSuat = 5.5; break;
        case 24: laiSuat = 6.0; break;
    }

    // Công thức tính lãi suất cuối kỳ: Gốc * Lãi suất * (Kỳ hạn gửi / 12)
    const tienLaiDuKien = soTienVal * (laiSuat / 100) * (kyHanVal / 12);

    rateSpan.innerText = `${laiSuat.toFixed(1)}%`;
    interestSpan.innerText = formatVND(tienLaiDuKien);
    infoBox.style.display = "block";
}

// Gửi yêu cầu mở sổ tiết kiệm
async function openSavingsAccount() {
    if (!stkCanManageSavings) { showNoPermission(); return; }
    const tkNguon = document.getElementById("tkNguon").value;
    const soTienGoc = parseFloat(document.getElementById("soTienGoc").value);
    const kyHan = parseInt(document.getElementById("kyHan").value);

    if (!tkNguon) {
        showToast("Vui lòng chọn tài khoản thanh toán trích nợ.", "warning");
        return;
    }
    if (isNaN(soTienGoc) || soTienGoc < 1000000) {
        showToast("Số tiền gửi tiết kiệm tối thiểu phải là 1,000,000 VND.", "warning");
        return;
    }
    if (!kyHan) {
        showToast("Vui lòng chọn kỳ hạn gửi tiết kiệm.", "warning");
        return;
    }

    const acc = accounts.find(a => a.soTaiKhoan === tkNguon);
    if (acc && acc.soDu < soTienGoc) {
        showToast("Số dư tài khoản thanh toán không đủ để mở sổ tiết kiệm này.", "error");
        return;
    }

    const confirmMsg = `Bạn xác nhận trích ${formatVND(soTienGoc)} từ tài khoản ${tkNguon} để mở sổ tiết kiệm kỳ hạn ${kyHan} tháng?`;
    if (!confirm(confirmMsg)) return;

    try {
        const body = {
            soTaiKhoan: tkNguon,
            soTienGoc: soTienGoc,
            kyHan: kyHan
        };

        const result = await apiPost("savings-accounts", body);

        if (result.success) {
            showToast(`🎉 Mở sổ tiết kiệm thành công!\nMã sổ: ${result.data.maSo}\nSố tiền: ${formatVND(soTienGoc)}`, "success", 5000);
            
            // Reset form
            document.getElementById("soTienGoc").value = "";
            document.getElementById("kyHan").value = "";
            document.getElementById("interestInfoBox").style.display = "none";
            document.getElementById("soTienChu").innerText = "";
            document.getElementById("tkNguonBalance").innerText = "";
            document.getElementById("tkNguon").value = "";

            // Load lại dữ liệu
            await loadAccounts();
            await loadSavingsAccounts();
        } else {
            showToast(result.message || "Không thể thực hiện yêu cầu.", "error");
        }
    } catch (error) {
        if (isForbiddenError(error)) showNoPermission(); else showToast("Lỗi hệ thống: " + error.message, "error");
    }
}

// Gửi yêu cầu tất toán sổ tiết kiệm
async function settleSavingsAccount(maSo) {
    if (!stkCanManageSavings) { showNoPermission(); return; }
    const confirmMsg = `Bạn xác nhận muốn tất toán Sổ tiết kiệm #${maSo}?\nTiền gốc và lãi thực nhận sẽ được chuyển trả về tài khoản thanh toán thụ hưởng.`;
    if (!confirm(confirmMsg)) return;

    try {
        showToast("Đang xử lý tất toán...", "info");

        const result = await apiPost(`savings-accounts/${maSo}/settle`, {});

        console.log("Kết quả tất toán:", result);

        if (result?.success === true || result?.data || result?.maSo) {

    showSuccessModal(
        "Tất toán thành công",
        "Tiền gốc và lãi đã được chuyển về tài khoản thanh toán."
    );

    setTimeout(() => {

        const btn = document.querySelector("#successModal button");

        if (btn) {
            btn.onclick = async function () {

                document.getElementById("successModal")?.remove();

                showSavingReceiptModal({
                    maSo: maSo,
                    taiKhoanNguon:
                        result?.data?.soTaiKhoan ||
                        result?.soTaiKhoan ||
                        "Tài khoản thanh toán",

                    soTien:
                        formatVND(
                            result?.data?.soTienNhan ||
                            result?.data?.tongTienNhan ||
                            result?.data?.soTienGoc ||
                            0
                        ),

                    ngayTatToan:
                        new Date().toLocaleString("vi-VN"),

                    trangThai:
                        "Đã tất toán"
                });

                await loadAccounts();
                await loadSavingsAccounts();
            };
        }

    }, 100);

} else {

            showToast(
                result?.message || "Tất toán thất bại. API không trả success.",
                "error",
                5000
            );
        }

    } catch (error) {

        console.error("Lỗi tất toán:", error);

        showToast(
            (isForbiddenError(error) ? "Bạn không có quyền thực hiện chức năng này." : "Lỗi khi gửi yêu cầu tất toán: " + error.message),
            "error",
            5000
        );
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadAccounts();
    loadSavingsAccounts();
    applySavingsPermissionUI();
});
function showSavingReceiptModal(data) {
    const oldModal = document.getElementById("savingReceiptModal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.id = "savingReceiptModal";

    modal.innerHTML = `
        <div style="
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        ">
            <div style="
                width: 430px;
                max-width: 92%;
                background: white;
                border-radius: 28px;
                padding: 32px;
                box-shadow: 0 25px 70px rgba(0,0,0,0.25);
                font-family: Outfit, Arial, sans-serif;
                color: #0f172a;
            ">
                <div style="text-align:center;">
                    <div style="font-size:42px;">💰</div>
                    <h2 style="margin:10px 0 4px; font-size:24px;">
                        TẤT TOÁN THÀNH CÔNG
                    </h2>
                    <p style="margin:0; color:#64748b;">GT SmartBank</p>
                </div>

                <hr style="border:none; border-top:1px dashed #cbd5e1; margin:22px 0;">

                <p><b>Mã sổ:</b><br>${data.maSo}</p>
                <p><b>Tài khoản nguồn:</b><br>${data.taiKhoanNguon}</p>
                <p><b>Số tiền nhận:</b><br>
                    <span style="font-size:24px; font-weight:800; color:#059669;">
                        ${data.soTien}
                    </span>
                </p>
                <p><b>Ngày tất toán:</b><br>${data.ngayTatToan}</p>
                <p><b>Trạng thái:</b><br>
                    <span style="color:#16a34a; font-weight:800;">
                        ✓ ${data.trangThai}
                    </span>
                </p>

                <button onclick="document.getElementById('savingReceiptModal').remove()"
                    style="
                        width:100%;
                        margin-top:20px;
                        padding:15px;
                        border:none;
                        border-radius:16px;
                        background:#059669;
                        color:white;
                        font-weight:800;
                        cursor:pointer;
                    ">
                    Đóng
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}