// Cấu hình URL API trỏ tới dịch vụ Render đọc từ config.js
const API_BASE_URL = typeof CONFIG !== "undefined" ? CONFIG.API_BASE_URL : "https://gtsmartbank-api.onrender.com/api";

function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem("token", token);
}

function removeToken() {
    localStorage.removeItem("token");
}

function getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

function removeCurrentUser() {
    localStorage.removeItem("user");
}

// Định nghĩa hàm hiển thị Loading Spinner toàn cục
function showSpinner() {
    let overlay = document.getElementById("loadingOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "loadingOverlay";
        overlay.className = "loading-overlay";
        overlay.innerHTML = `
            <div class="loading-card">
                <div class="spinner-ring"></div>
                <span>Đang xử lý giao dịch...</span>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.classList.add("show");
}

// Ẩn Loading Spinner
function hideSpinner() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
        overlay.classList.remove("show");
    }
}

// Hàm chuyển hóa lỗi kỹ thuật thô thành thông báo thân thiện chuyên nghiệp cho người dùng
function sanitizeErrorMessage(error) {
    if (!error) return "Đã xảy ra lỗi hệ thống không xác định. Vui lòng thử lại sau.";
    
    let message = typeof error === 'string' ? error : (error.message || "");
    
    // 1. Kiểm tra lỗi mạng / mất kết nối
    if (
        message.includes("Failed to fetch") || 
        message.includes("NetworkError") || 
        message.includes("network") ||
        message.toLowerCase().includes("failed to fetch")
    ) {
        return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.";
    }
    
    // 2. Kiểm tra lỗi parse JSON (khi server trả về HTML lỗi 500 hoặc 404 thay vì JSON)
    if (
        message.includes("Unexpected token") || 
        message.includes("is not valid JSON") || 
        message.includes("JSON.parse") ||
        message.includes("JSON_PARSE_ERROR") ||
        message.includes("HTML_RESPONSE_ERROR")
    ) {
        return "Đã xảy ra sự cố xử lý yêu cầu trên máy chủ. Vui lòng thử lại sau.";
    }
    
    // 3. Các lỗi kỹ thuật nhạy cảm: SQL Server, Entity Framework, NullReferenceException, etc.
    const technicalKeywords = [
        "sql", "database", "dbupdate", "exception", "nullreference", 
        "sequence contains", "foreign key", "constraint", "syntax error", 
        "object reference", "connection", "entity", "ef core", "dbcontext",
        "stack trace", "an error occurred while saving the entity changes"
    ];
    
    const hasTechnicalKeyword = technicalKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );
    
    if (hasTechnicalKeyword) {
        return "Yêu cầu không thể thực hiện do lỗi xử lý dữ liệu hệ thống. Vui lòng liên hệ bộ phận hỗ trợ.";
    }
    
    return message || "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
}

// Xuất hàm này ra phạm vi toàn cục (window) để các file script khác (như theme.js) dùng chung
window.sanitizeErrorMessage = sanitizeErrorMessage;

// Hàm gọi API tổng quát hỗ trợ xử lý lỗi chuẩn ApiResponse và tự động hiển thị Spinner
async function apiRequest(endpoint, method = "GET", body = null) {
    const headers = {
        "Content-Type": "application/json"
    };

    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    // Hiển thị loading spinner cho mỗi yêu cầu API
    showSpinner();

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
        
        // Xử lý khi Token hết hạn hoặc không hợp lệ
        if (response.status === 401) {
            removeToken();
            removeCurrentUser();
            // Nếu không ở trang login, chuyển hướng về login
            if (!window.location.pathname.endsWith("login.html")) {
                window.location.href = "/pages/login.html";
            }
            throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            try {
                data = await response.json();
            } catch (jsonErr) {
                console.error("Lỗi phân tích cú pháp JSON phản hồi từ API:", jsonErr);
                throw new Error("JSON_PARSE_ERROR");
            }
        } else {
            // Không phải JSON, có thể là trang lỗi HTML 500/404 của IIS/Kestrel
            const textResponse = await response.text();
            console.error("Server trả về phản hồi không phải JSON:", textResponse);
            throw new Error("HTML_RESPONSE_ERROR");
        }

        if (!response.ok) {
            // Lấy thông điệp lỗi từ ApiResponse của backend gửi về
            const errorMsg = data.message || `Lỗi hệ thống (${response.status})`;
            throw new Error(errorMsg);
        }

        // Backend trả về chuẩn ApiResponse: { success: true, message: "...", data: ... }
        return data;
    } catch (error) {
        console.error(`Lỗi API [${method} ${endpoint}]:`, error);
        
        // Làm sạch thông báo lỗi trước khi ném ra cho UI
        const friendlyMessage = sanitizeErrorMessage(error);
        const sanitizedError = new Error(friendlyMessage);
        // Giữ lại lỗi gốc cho mục đích debug của nhà phát triển
        sanitizedError.originalError = error;
        throw sanitizedError;
    } finally {
        // Luôn luôn ẩn loading spinner sau khi yêu cầu hoàn tất hoặc lỗi
        hideSpinner();
    }
}

// Các hàm tiện ích
async function apiGet(endpoint) {
    return apiRequest(endpoint, "GET");
}

async function apiPost(endpoint, body) {
    return apiRequest(endpoint, "POST", body);
}

async function apiPut(endpoint, body) {
    return apiRequest(endpoint, "PUT", body);
}

async function apiDelete(endpoint) {
    return apiRequest(endpoint, "DELETE");
}