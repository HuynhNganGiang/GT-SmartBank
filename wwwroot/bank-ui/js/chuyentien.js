let accounts = [];
let otpInterval = null;

// Tải danh sách tài khoản thanh toán khi load trang
async function loadAccounts() {
    try {
        const result = await apiGet("accounts");
        accounts = result.data || [];
        
        const tkNguonSelect = document.getElementById("tkNguon");
        // Xóa các option cũ trừ option mặc định
        tkNguonSelect.innerHTML = '<option value="">-- Chọn tài khoản thanh toán --</option>';
        
        accounts.forEach(acc => {
            if (acc.trangThai) { // Chỉ hiển thị tài khoản đang hoạt động
                const option = document.createElement("option");
                option.value = acc.soTaiKhoan;
                option.innerText = `${acc.soTaiKhoan} - ${acc.loaiTaiKhoan} (${formatVND(acc.soDu)})`;
                tkNguonSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Không tải được danh sách tài khoản nguồn:", error);
    }
}

// Cập nhật hiển thị số dư của tài khoản nguồn được chọn
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
        
        // Tự điền gợi ý nội dung chuyển khoản
        const currentUser = getCurrentUser();
        const noiDungTextarea = document.getElementById("noiDung");
        if (noiDungTextarea && !noiDungTextarea.value.trim()) {
            noiDungTextarea.value = `${currentUser.hoTen.toUpperCase()} CHUYEN TIEN`;
        }
    }
}

// Kiểm tra sự tồn tại của tài khoản đích
async function checkDestAccount() {
    const tkDich = document.getElementById("tkDich").value.trim();
    const destNameBox = document.getElementById("destNameBox");
    
    if (!tkDich) {
        destNameBox.style.display = "block";
        destNameBox.style.backgroundColor = "#fce8e6";
        destNameBox.style.color = "#c5221f";
        destNameBox.innerText = "Vui lòng nhập số tài khoản đích.";
        return;
    }

    try {
        const result = await apiGet(`accounts/${tkDich}`);
        if (result.success && result.data) {
            destNameBox.style.display = "block";
            destNameBox.style.backgroundColor = "#e8f5e9";
            destNameBox.style.color = "#2e7d32";
            destNameBox.innerText = `✔️ Chủ tài khoản: ${result.data.tenKhachHang.toUpperCase()}`;
        } else {
            showDestError("Tài khoản thụ hưởng không tồn tại.");
        }
    } catch (error) {
        showDestError("Không tìm thấy tài khoản thụ hưởng.");
    }
}

function showDestError(msg) {
    const destNameBox = document.getElementById("destNameBox");
    destNameBox.style.display = "block";
    destNameBox.style.backgroundColor = "#fce8e6";
    destNameBox.style.color = "#c5221f";
    destNameBox.innerText = `❌ Lỗi: ${msg}`;
}

function hideDestName() {
    document.getElementById("destNameBox").style.display = "none";
}

// Format hiển thị số tiền phân tách hàng nghìn
function formatTienWord() {
    const soTien = parseFloat(document.getElementById("soTien").value);
    const textP = document.getElementById("soTienChu");
    
    if (isNaN(soTien) || soTien <= 0) {
        textP.innerText = "";
        return;
    }
    
    textP.innerText = `Số tiền hiển thị: ${formatVND(soTien)}`;
}

// Lấy mã xác thực OTP
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
        showToast("Vui lòng nhập số tài khoản đích.", "warning");
        return;
    }
    if (tkNguon === tkDich) {
        showToast("Tài khoản nguồn và tài khoản đích không được trùng nhau.", "warning");
        return;
    }
    if (!soTienVal || parseFloat(soTienVal) < 10000) {
        showToast("Số tiền chuyển tối thiểu là 10,000 VND.", "warning");
        return;
    }
    if (!noiDung) {
        showToast("Vui lòng nhập nội dung chuyển tiền.", "warning");
        return;
    }

    const acc = accounts.find(a => a.soTaiKhoan === tkNguon);
    if (acc && acc.soDu < parseFloat(soTienVal)) {
        showToast("Số dư tài khoản nguồn không đủ để thực hiện giao dịch.", "error");
        return;
    }

    const btnGetOtp = document.getElementById("btnGetOtp");
    btnGetOtp.disabled = true;
    btnGetOtp.innerText = "Đang tạo OTP...";

    try {
        // Gửi POST request với query string parameter soTaiKhoan
        const result = await apiRequest(`otps/generate?soTaiKhoan=${tkNguon}`, "POST");
        
        if (result.success && result.data) {
            const otpCode = result.data.otp;
            
            // Hiển thị khung OTP
            document.getElementById("otpContainer").style.display = "block";
            document.getElementById("otpCodeShow").innerText = otpCode;
            
            // Kích hoạt Countdown
            startOtpTimer(180);
            
            btnGetOtp.innerText = "Đã gửi mã OTP";
        } else {
            showToast(result.message || "Không thể sinh mã OTP.", "error");
            btnGetOtp.disabled = false;
            btnGetOtp.innerText = "Nhận mã xác thực OTP";
        }
    } catch (error) {
        showToast(error.message || "Lỗi khi kết nối yêu cầu OTP.", "error");
        btnGetOtp.disabled = false;
        btnGetOtp.innerText = "Nhận mã xác thực OTP";
    }
}

// Bắt đầu đếm ngược OTP
function startOtpTimer(durationSeconds) {
    if (otpInterval) clearInterval(otpInterval);
    
    let timeRemaining = durationSeconds;
    const timerSpan = document.getElementById("countdownTimer");
    timerSpan.innerText = timeRemaining;

    otpInterval = setInterval(() => {
        timeRemaining--;
        timerSpan.innerText = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(otpInterval);
            document.getElementById("otpContainer").style.display = "none";
            
            const btnGetOtp = document.getElementById("btnGetOtp");
            btnGetOtp.disabled = false;
            btnGetOtp.innerText = "Nhận mã xác thực OTP";
            
            showToast("Mã OTP đã hết hiệu lực. Vui lòng nhận mã mới.", "warning");
        }
    }, 1000);
}

// Xác nhận giao dịch chuyển tiền
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

    const btnConfirmTransfer = document.getElementById("btnConfirmTransfer");
    btnConfirmTransfer.disabled = true;
    btnConfirmTransfer.innerText = "Đang thực hiện chuyển tiền...";

    try {
        const requestBody = {
            TK_Nguon: tkNguon,
            TK_Dich: tkDich,
            SoTien: soTien,
            NoiDung: noiDung,
            MaOTP: maOtp
        };

        const result = await apiPost("transactions/transfer", requestBody);

        if (result.success) {
            clearInterval(otpInterval);
            showToast("🎉 Chuyển khoản thành công!\nSố tiền: " + formatVND(soTien) + "\nTới tài khoản: " + tkDich, "success", 5000);
            
            // Reset form
            document.getElementById("tkDich").value = "";
            document.getElementById("soTien").value = "";
            document.getElementById("noiDung").value = "";
            document.getElementById("maOtp").value = "";
            document.getElementById("otpContainer").style.display = "none";
            document.getElementById("destNameBox").style.display = "none";
            document.getElementById("soTienChu").innerText = "";
            
            const btnGetOtp = document.getElementById("btnGetOtp");
            btnGetOtp.disabled = false;
            btnGetOtp.innerText = "Nhận mã xác thực OTP";

            // Load lại danh sách tài khoản nguồn để cập nhật số dư mới nhất
            await loadAccounts();
            document.getElementById("tkNguonBalance").innerText = "";
        } else {
            showToast(result.message || "Giao dịch không thành công.", "error");
            btnConfirmTransfer.disabled = false;
            btnConfirmTransfer.innerText = "Xác nhận chuyển khoản";
        }
    } catch (error) {
        showToast("Lỗi giao dịch: " + error.message, "error");
        btnConfirmTransfer.disabled = false;
        btnConfirmTransfer.innerText = "Xác nhận chuyển khoản";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadAccounts();
});
