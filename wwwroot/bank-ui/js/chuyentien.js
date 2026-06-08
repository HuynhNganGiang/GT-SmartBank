// Chuyển tiền 24/7 - GT SmartBank

let accounts = [];
let otpInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    loadAccounts();

    const tkNguon = document.getElementById("tkNguon");
    if (tkNguon) {
        tkNguon.addEventListener("change", updateBalanceInfo);
    }

    const soTien = document.getElementById("soTien");
    if (soTien) {
        soTien.addEventListener("input", formatTienWord);
    }
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
    const tkNguonSelect = document.getElementById("tkNguon");
    if (!tkNguonSelect) return;

    tkNguonSelect.innerHTML = `<option value="">-- Đang tải tài khoản --</option>`;

    try {
        const result = await apiGetFirst([
    "accounts"
]);

accounts = Array.isArray(result)
    ? result
    : Array.isArray(result.data)
        ? result.data
        : [];

console.log("Danh sách tài khoản chuyển tiền:", accounts);

tkNguonSelect.innerHTML = `<option value="">-- Chọn tài khoản thanh toán --</option>`;

accounts.forEach(acc => {
    const soTaiKhoan = getValue(acc, "soTaiKhoan", "SoTaiKhoan");
    const loaiTaiKhoan = getValue(acc, "loaiTaiKhoan", "LoaiTaiKhoan") || "Thanh toán";
    const soDu = getValue(acc, "soDu", "SoDu") || 0;

    if (soTaiKhoan) {
        const option = document.createElement("option");
        option.value = soTaiKhoan;
        option.innerText = `${soTaiKhoan} - ${loaiTaiKhoan} (${formatVND(soDu)})`;
        tkNguonSelect.appendChild(option);
    }
});

        if (tkNguonSelect.options.length === 1) {
            const option = document.createElement("option");
            option.value = "";
            option.innerText = "Không có tài khoản hoạt động";
            tkNguonSelect.appendChild(option);
        }

    } catch (error) {
        console.error("Không tải được tài khoản nguồn:", error);
        tkNguonSelect.innerHTML = `<option value="">Không thể tải tài khoản</option>`;
        showToast("Không thể tải danh sách tài khoản nguồn.", "error");
    }
}

function updateBalanceInfo() {
    const tkNguon = document.getElementById("tkNguon").value;
    const balanceP = document.getElementById("tkNguonBalance");

    if (!balanceP) return;

    if (!tkNguon) {
        balanceP.innerText = "";
        return;
    }

    const acc = accounts.find(a => String(getValue(a, "soTaiKhoan", "SoTaiKhoan")) === String(tkNguon));

    if (acc) {
        const soDu = getValue(acc, "soDu", "SoDu") || 0;
        balanceP.innerText = `Số dư khả dụng: ${formatVND(soDu)}`;

        const currentUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
        const noiDungTextarea = document.getElementById("noiDung");

        if (noiDungTextarea && !noiDungTextarea.value.trim()) {
            noiDungTextarea.value = currentUser && currentUser.hoTen
                ? `${currentUser.hoTen.toUpperCase()} CHUYEN TIEN`
                : "GT SMARTBANK CHUYEN TIEN";
        }
    }
}

async function checkDestAccount() {
    const tkDich = document.getElementById("tkDich").value.trim();
    const destNameBox = document.getElementById("destNameBox");

    if (!destNameBox) return;

    if (!tkDich) {
        showDestError("Vui lòng nhập số tài khoản thụ hưởng.");
        return;
    }

    try {
        const result = await apiGet(`accounts/${tkDich}`);

        if (result && result.data) {
            const tenKhachHang = getValue(result.data, "tenKhachHang", "TenKhachHang", "hoTen", "HoTen") || "Khách hàng GT SmartBank";

            destNameBox.style.display = "block";
            destNameBox.style.backgroundColor = "#e8f5e9";
            destNameBox.style.color = "#166534";
            destNameBox.innerText = `✔ Chủ tài khoản: ${tenKhachHang.toUpperCase()}`;
        } else {
            showDestError("Tài khoản thụ hưởng không tồn tại.");
        }
    } catch (error) {
        showDestError("Không tìm thấy tài khoản thụ hưởng.");
    }
}

function showDestError(message) {
    const destNameBox = document.getElementById("destNameBox");
    if (!destNameBox) return;

    destNameBox.style.display = "block";
    destNameBox.style.backgroundColor = "#fce8e6";
    destNameBox.style.color = "#c5221f";
    destNameBox.innerText = message;
}

function formatTienWord() {
    const soTienInput = document.getElementById("soTien");
    const textP = document.getElementById("soTienChu");

    if (!soTienInput || !textP) return;

    const soTien = parseFloat(soTienInput.value);

    if (isNaN(soTien) || soTien <= 0) {
        textP.innerText = "";
        return;
    }

    textP.innerText = `Số tiền hiển thị: ${formatVND(soTien)}`;
}
function parseMoney(value) {
    if (value === null || value === undefined) return 0;
    return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
}

function safeNotify(message, type = "info") {
    if (typeof showToast === "function") {
        showToast(message, type);
    } else {
        alert(message);
    }
}

function showBankAlert(title, message) {
    const oldModal = document.getElementById("bankAlertModal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.id = "bankAlertModal";

    modal.innerHTML = `
    <div style="
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.55);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:99999;
    ">
        <div style="
            width:420px;
            max-width:92%;
            background:#fff;
            border-radius:20px;
            padding:24px;
            box-shadow:0 25px 70px rgba(0,0,0,.25);
            text-align:center;
        ">
            <div style="
                font-size:48px;
                color:#dc2626;
                margin-bottom:10px;
            ">
                ⚠️
            </div>

            <h3 style="margin-bottom:10px;color:#0f172a;">
                ${title}
            </h3>

            <p style="color:#475569;">
                ${message}
            </p>

            <button
                onclick="document.getElementById('bankAlertModal').remove()"
                style="
                    margin-top:18px;
                    padding:12px 30px;
                    border:none;
                    border-radius:12px;
                    background:#dc2626;
                    color:white;
                    font-weight:bold;
                    cursor:pointer;
                ">
                Đã hiểu
            </button>
        </div>
    </div>
    `;

    document.body.appendChild(modal);
}

function hideDestName() {
    const destNameBox = document.getElementById("destNameBox");
    if (destNameBox) {
        destNameBox.style.display = "none";
        destNameBox.innerText = "";
    }
}

async function getOtpCode() {
    const tkNguon = document.getElementById("tkNguon").value;
    const tkDich = document.getElementById("tkDich").value.trim();
    const soTienVal = document.getElementById("soTien").value.trim();
    const noiDung = document.getElementById("noiDung").value.trim();

    if (!tkNguon) {
        showToast("Vui lòng chọn tài khoản nguồn.", "warning");
        return;
    }

    if (!tkDich) {
        showToast("Vui lòng nhập số tài khoản thụ hưởng.", "warning");
        return;
    }

    if (tkNguon === tkDich) {
        showToast("Tài khoản nguồn và tài khoản thụ hưởng không được trùng nhau.", "warning");
        return;
    }

    if (!soTienVal || parseFloat(soTienVal) < 10000) {
        showToast("Số tiền chuyển tối thiểu là 10.000 VND.", "warning");
        return;
    }

    if (!noiDung) {
        showToast("Vui lòng nhập nội dung chuyển tiền.", "warning");
        return;
    }

    const acc = accounts.find(a => String(getValue(a, "soTaiKhoan", "SoTaiKhoan")) === String(tkNguon));
    const soDu = parseMoney(getValue(acc, "soDu", "SoDu"));

    if (!acc) {
    showToast("Không tìm thấy tài khoản nguồn.", "error");
    return;
}

if (Number(soTienVal) > soDu) {

    showBankAlert(
        "Không đủ số dư",
        `Số dư hiện tại của bạn là ${formatVND(soDu)} nhưng số tiền chuyển là ${formatVND(soTienVal)}`
    );

    return;
}

    const otpContainer = document.getElementById("otpContainer");
    const btnGetOtp = document.getElementById("btnGetOtp");

    if (btnGetOtp) {
        btnGetOtp.disabled = true;
        btnGetOtp.innerText = "Đã gửi mã OTP";
    }

    if (otpContainer) {
        otpContainer.style.display = "block";
    }

    const otpResult = await apiPost(
    `otps/generate?soTaiKhoan=${tkNguon}`,
    {}
);

console.log("OTP Response:", otpResult);

const otp =
    otpResult?.data?.maCode ||
    otpResult?.data?.maOTP ||
    otpResult?.data?.otp ||
    otpResult?.maCode ||
    otpResult?.maOTP ||
    otpResult?.otp ||
    "XXXXXX";

document.getElementById("otpCodeShow").innerText = otp;
document.getElementById("maOtp").value = otp !== "XXXXXX" ? otp : "";

showToast("Đã tạo mã OTP thành công.", "success");

startOtpTimer(180);
}

function startOtpTimer(durationSeconds) {
    if (otpInterval) clearInterval(otpInterval);

    let timeRemaining = durationSeconds;
    const timerSpan = document.getElementById("countdownTimer");

    if (timerSpan) timerSpan.innerText = timeRemaining;

    otpInterval = setInterval(() => {
        timeRemaining--;

        if (timerSpan) timerSpan.innerText = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(otpInterval);

            const otpContainer = document.getElementById("otpContainer");
            const btnGetOtp = document.getElementById("btnGetOtp");

            if (otpContainer) otpContainer.style.display = "none";

            if (btnGetOtp) {
                btnGetOtp.disabled = false;
                btnGetOtp.innerText = "Nhận mã xác thực OTP";
            }

            showToast("Mã OTP đã hết hiệu lực. Vui lòng nhận mã mới.", "warning");
        }
    }, 1000);
}

async function confirmTransfer() {
    const tkNguon = document.getElementById("tkNguon").value;
    const tkDich = document.getElementById("tkDich").value.trim();
    const soTien = parseFloat(document.getElementById("soTien").value);
    const noiDung = document.getElementById("noiDung").value.trim();
    const maOtp = document.getElementById("maOtp").value.trim();   
    
    const acc = accounts.find(a =>
    String(getValue(a, "soTaiKhoan", "SoTaiKhoan")) === String(tkNguon)
);

if (!acc) {
    showToast("Không tìm thấy tài khoản nguồn.", "error");
    return;
}

const soDu = parseMoney(getValue(acc, "soDu", "SoDu"));

if (soTien > soDu) {

    showBankAlert(
        "Không đủ số dư",
        `Số dư hiện tại của bạn là ${formatVND(soDu)} nhưng số tiền chuyển là ${formatVND(soTien)}`
    );

    return;
}

    if (!maOtp || maOtp.length !== 6) {
        showToast("Vui lòng nhập mã OTP gồm 6 chữ số.", "warning");
        return;
    }

    const btnConfirmTransfer = document.getElementById("btnConfirmTransfer");

    if (btnConfirmTransfer) {
        btnConfirmTransfer.disabled = true;
        btnConfirmTransfer.innerText = "Đang xử lý...";
    }

    try {
        const requestBody = {
    tk_Nguon: tkNguon,
    tk_Dich: tkDich,
    soTien: soTien,
    noiDung: noiDung,
    maOTP: maOtp
};

console.log("Request chuyển tiền:", requestBody);

        let result = null;

        try {
            result = await apiPost("GiaoDich/ChuyenTien", requestBody);
        } catch {
            result = await apiPost("transactions/transfer", requestBody);
            console.log("Kết quả chuyển tiền:", result);
        }

        if (result && result.success !== false) {
            clearInterval(otpInterval);

            showSuccessModal(
    "Chuyển khoản thành công",
    `Giao dịch ${formatVND(soTien)} đã được xử lý thành công.`
);

setTimeout(() => {
    const successModalBtn =
        document.querySelector("#successModal button");

    if (successModalBtn) {

        successModalBtn.onclick = async function () {

            document.getElementById("successModal").remove();

            showReceiptModal({
                maGD:
                    result?.data?.maGD ||
                    result?.maGD ||
                    ("GD" + Date.now().toString().slice(-6)),

                ngayGD: new Date().toLocaleString("vi-VN"),

                tkNguon: tkNguon,
                tkDich: tkDich,
                soTien: formatVND(soTien)
            });

            document.getElementById("tkDich").value = "";
            document.getElementById("soTien").value = "";
            document.getElementById("noiDung").value = "";
            document.getElementById("maOtp").value = "";

            const otpContainer = document.getElementById("otpContainer");
            const destNameBox = document.getElementById("destNameBox");
            const soTienChu = document.getElementById("soTienChu");
            const tkNguonBalance = document.getElementById("tkNguonBalance");

            if (otpContainer) otpContainer.style.display = "none";
            if (destNameBox) destNameBox.style.display = "none";
            if (soTienChu) soTienChu.innerText = "";
            if (tkNguonBalance) tkNguonBalance.innerText = "";

            await loadAccounts();
        };
    }
}, 100);
        } else {
            showToast(result.message || "Giao dịch không thành công.", "error");
        }
    } catch (error) {
        showToast("Lỗi giao dịch: " + error.message, "error");
    } finally {
        if (btnConfirmTransfer) {
            btnConfirmTransfer.disabled = false;
            btnConfirmTransfer.innerText = "Xác nhận chuyển khoản";
        }
    }
}
function showReceiptModal(data) {
    const oldModal = document.getElementById("receiptModal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.id = "receiptModal";
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
                width: 420px;
                max-width: 92%;
                background: white;
                border-radius: 24px;
                padding: 28px;
                box-shadow: 0 25px 70px rgba(0,0,0,0.25);
                font-family: Arial, sans-serif;
            ">
                <div style="text-align:center; margin-bottom:18px;">
                    <div style="font-size:42px; color:#16a34a;">✓</div>
                    <h2 style="margin:8px 0 4px; color:#0f172a;">
                        BIÊN LAI GIAO DỊCH
                    </h2>
                    <p style="margin:0; color:#64748b;">GT SmartBank</p>
                </div>

                <hr style="border:none; border-top:1px dashed #cbd5e1; margin:18px 0;">

                <p><b>Mã GD:</b> ${data.maGD}</p>
                <p><b>Ngày GD:</b> ${data.ngayGD}</p>
                <p><b>TK nguồn:</b><br>${data.tkNguon}</p>
                <p><b>TK nhận:</b><br>${data.tkDich}</p>
                <p><b>Số tiền:</b><br>
                    <span style="font-size:22px; font-weight:bold; color:#dc2626;">
                        ${data.soTien}
                    </span>
                </p>
                <p><b>Trạng thái:</b>
                    <span style="color:#16a34a; font-weight:bold;">✓ Thành công</span>
                </p>

                <button onclick="document.getElementById('receiptModal').remove()"
                    style="
                        width:100%;
                        margin-top:18px;
                        padding:13px;
                        border:none;
                        border-radius:14px;
                        background:#16a34a;
                        color:white;
                        font-weight:bold;
                        cursor:pointer;
                    ">
                    Hoàn tất
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}
