async function login() {
    const soDienThoaiInput = document.getElementById("soDienThoai");
    const matKhauInput = document.getElementById("matKhau");
    const loginBtn = document.getElementById("loginBtn");
    const errorMsgDiv = document.getElementById("errorMsg");

    const soDienThoai = soDienThoaiInput.value.trim();
    const matKhau = matKhauInput.value.trim();

    if (!soDienThoai || !matKhau) {
        showError("Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ sá»‘ Ä‘iá»‡n thoáº¡i vÃ  máº­t kháº©u.");
        return;
    }

    // Hiá»ƒn thá»‹ tráº¡ng thÃ¡i loading
    loginBtn.disabled = true;
    loginBtn.innerText = "Äang Ä‘Äƒng nháº­p...";
    if (errorMsgDiv) errorMsgDiv.style.display = "none";

    try {
        const result = await apiPost("auth/login", {
            soDienThoai: soDienThoai,
            matKhau: matKhau
        });

        if (result.success && result.data && result.data.accessToken) {
            // LÆ°u token vÃ  thÃ´ng tin user vÃ o localStorage
            setToken(result.data.accessToken);
            if (result.data.refreshToken) {
                localStorage.setItem("refreshToken", result.data.refreshToken);
            }
            setCurrentUser(result.data.user);

            // Hiá»ƒn thá»‹ thÃ´ng bÃ¡o thÃ nh cÃ´ng
            loginBtn.innerText = "ÄÄƒng nháº­p thÃ nh cÃ´ng!";
            loginBtn.style.backgroundColor = "#28a745";
            
            setTimeout(() => {
                window.location.href = "/admin/dashboard.html";
            }, 1000);
        } else {
            showError(result.message || "ÄÄƒng nháº­p tháº¥t báº¡i.");
            resetLoginButton();
        }
    } catch (error) {
        showError(error.message || "Lá»—i káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.");
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
        loginBtn.innerText = "ÄÄƒng nháº­p";
    }
}

// Báº¯t sá»± kiá»‡n nháº¥n Enter trong Ã´ máº­t kháº©u
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