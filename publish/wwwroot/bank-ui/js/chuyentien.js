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
        const result = await apiGetFirst([
            `TaiKhoan/${tkDich}`,
            `accounts/${tkDich}`
        ]);

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
    const soDu = Number(getValue(acc, "soDu", "SoDu") || 0);

    if (acc && soDu < parseFloat(soTienVal)) {
        showToast("Số dư tài khoản nguồn không đủ để thực hiện giao dịch.", "error");
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

    showToast("Mã OTP demo là 123456.", "info", 5000);
    startOtpTimer(60);
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

    if (!maOtp || maOtp.length !== 6) {
        showToast("Vui lòng nhập mã OTP gồm 6 chữ số.", "warning");
        return;
    }

    if (maOtp !== "123456") {
        showToast("Mã OTP demo không đúng. Vui lòng nhập 123456.", "error");
        return;
    }

    const btnConfirmTransfer = document.getElementById("btnConfirmTransfer");

    if (btnConfirmTransfer) {
        btnConfirmTransfer.disabled = true;
        btnConfirmTransfer.innerText = "Đang xử lý...";
    }

    try {
        const requestBody = {
            TK_Nguon: tkNguon,
            TK_Dich: tkDich,
            SoTien: soTien,
            NoiDung: noiDung,
            MaOTP: maOtp
        };

        let result = null;

        try {
            result = await apiPost("GiaoDich/ChuyenTien", requestBody);
        } catch {
            result = await apiPost("transactions/transfer", requestBody);
        }

        if (result && result.success !== false) {
            clearInterval(otpInterval);

            showToast(`Chuyển khoản thành công! Số tiền: ${formatVND(soTien)}`, "success", 5000);

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
