async function login() {
    const soDienThoaiInput = document.getElementById("soDienThoai");
    const matKhauInput = document.getElementById("matKhau");
    const loginBtn = document.getElementById("loginBtn");
    const errorMsgDiv = document.getElementById("errorMsg");

    const soDienThoai = soDienThoaiInput.value.trim();
    const matKhau = matKhauInput.value.trim();

    const lockUntil = Number(localStorage.getItem("loginLockUntil") || 0);

    if (lockUntil && Date.now() < lockUntil) {
        const minutesLeft = Math.ceil((lockUntil - Date.now()) / 60000);
        showError(`Bạn đã nhập sai quá 5 lần. Tài khoản tạm khóa. Vui lòng thử lại sau ${minutesLeft} phút.`);
        return;
    }

    if (lockUntil && Date.now() >= lockUntil) {
        localStorage.removeItem("loginLockUntil");
        localStorage.removeItem("loginFailCount");
    }

    if (!soDienThoai || !matKhau) {
        showError("Vui lòng nhập đầy đủ số điện thoại và mật khẩu.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerText = "Đang đăng nhập...";
    if (errorMsgDiv) errorMsgDiv.style.display = "none";

    try {
        const result = await apiPost("auth/login", {
            soDienThoai: soDienThoai,
            matKhau: matKhau
        });

        if (result.success && result.data && result.data.accessToken) {
            localStorage.removeItem("loginFailCount");
            localStorage.removeItem("loginLockUntil");

            setToken(result.data.accessToken);

            if (result.data.refreshToken) {
                localStorage.setItem("refreshToken", result.data.refreshToken);
            }

            setCurrentUser(result.data.user);

            loginBtn.innerText = "Đăng nhập thành công!";
            loginBtn.style.backgroundColor = "#28a745";

            setTimeout(() => {
                window.location.href = "/bank-ui/admin/dashboard.html";
            }, 1000);
        } else {
            handleLoginFail(result.message);
            resetLoginButton();
        }
    } catch (error) {
        handleLoginFail();
        resetLoginButton();
    }
}
function handleLoginFail(serverMessage) {
    let loginFailCount = Number(localStorage.getItem("loginFailCount") || 0);
    loginFailCount++;

    localStorage.setItem("loginFailCount", loginFailCount);

    if (loginFailCount >= 5) {
        const lockUntil = Date.now() + 15 * 60 * 1000;
        localStorage.setItem("loginLockUntil", lockUntil);

        showError("Bạn đã nhập sai quá 5 lần. Tài khoản tạm khóa 15 phút.");
        return;
    }

    showError(`Sai số điện thoại hoặc sai mật khẩu. Bạn còn ${5 - loginFailCount} lần thử.`);
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
        loginBtn.innerText = "Đăng nhập hệ thống";
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

// Tự động nạp Trợ lý ảo AI Assistant nổi
(function() {
    if (!document.getElementById("ai-assistant-script")) {
        const script = document.createElement("script");
        script.id = "ai-assistant-script";
        script.src = "/bank-ui/js/ai-assistant.js";
        script.async = true;
        document.head.appendChild(script);
    }
})();