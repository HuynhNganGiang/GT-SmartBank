async function login() {
    const soDienThoaiInput = document.getElementById("soDienThoai");
    const matKhauInput = document.getElementById("matKhau");
    const loginBtn = document.getElementById("loginBtn");
    const errorMsgDiv = document.getElementById("errorMsg");

    const soDienThoai = soDienThoaiInput.value.trim();
    const matKhau = matKhauInput.value.trim();

    if (!soDienThoai || !matKhau) {
        showError("Vui lòng nhập đầy đủ số điện thoại và mật khẩu.");
        return;
    }

    // Hiển thị trạng thái loading
    loginBtn.disabled = true;
    loginBtn.innerText = "Đang đăng nhập...";
    if (errorMsgDiv) errorMsgDiv.style.display = "none";

    try {
        const result = await apiPost("auth/login", {
            soDienThoai: soDienThoai,
            matKhau: matKhau
        });

        if (result.success && result.data && result.data.accessToken) {
            // Lưu token và thông tin user vào localStorage
            setToken(result.data.accessToken);
            if (result.data.refreshToken) {
                localStorage.setItem("refreshToken", result.data.refreshToken);
            }
            setCurrentUser(result.data.user);

            // Hiển thị thông báo thành công
            loginBtn.innerText = "Đăng nhập thành công!";
            loginBtn.style.backgroundColor = "#28a745";
            
            setTimeout(() => {
                window.location.href = "/bank-ui/admin/dashboard.html";
            }, 1000);
        } else {
            showError(result.message || "Đăng nhập thất bại.");
            resetLoginButton();
        }
    } catch (error) {
        showError(error.message || "Lỗi kết nối đến máy chủ.");
        resetLoginButton();
    }
}

function showError(message) {
    const errorMsgDiv = document.getElementById("errorMsg");
    if (errorMsgDiv) {
        errorMsgDiv.innerText = message;
        errorMsgDiv.style.display = "block";
        errorMsgDiv.classList.add("shake-animation");
        setTimeout(() => {
            errorMsgDiv.classList.remove("shake-animation");
        }, 500);
    } else {
        if (typeof window.showToast === "function") {
            window.showToast(message, "error");
        } else {
            alert(message);
        }
    }
}

function resetLoginButton() {
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerText = "Đăng nhập";
    }
}

// Bắt sự kiện nhấn Enter trong ô mật khẩu
document.addEventListener("DOMContentLoaded", () => {
    const matKhauInput = document.getElementById("matKhau");
    if (matKhauInput) {
        matKhauInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                login();
            }
        });
    }

    const soDienThoaiInput = document.getElementById("soDienThoai");
    if (soDienThoaiInput) {
        soDienThoaiInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                matKhauInput.focus();
            }
        });
    }
});