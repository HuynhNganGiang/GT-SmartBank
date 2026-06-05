// AI Banking Assistant - GT SmartBank
// Tự động tiêm DOM, quản lý CSS tùy biến, lưu trữ localStorage và giả lập phản hồi AI chuyên nghiệp

(function() {
    // 1. Tạo các CSS styles cần thiết cho Chatbot và chèn vào Head
    const style = document.createElement("style");
    style.id = "ai-assistant-styles";
    style.innerHTML = `
        /* Khung nổi chatbot */
        .ai-chat-widget {
            font-family: 'Poppins', 'Inter', 'Outfit', sans-serif;
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        /* Nút tròn kích hoạt */
        .ai-chat-trigger {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #00224f 0%, #00569e 100%);
            border: 2px solid #ffffff;
            box-shadow: 0 10px 25px -5px rgba(0, 86, 158, 0.4), 0 8px 10px -6px rgba(0, 86, 158, 0.4);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        .ai-chat-trigger:hover {
            transform: scale(1.08) rotate(5deg);
            box-shadow: 0 20px 30px -8px rgba(0, 86, 158, 0.5);
        }
        .dark .ai-chat-trigger {
            border-color: #1e293b;
        }
            /* Bubble lời chào */
.ai-chat-greeting {
    background: #ffffff;
    color: #0f172a;
    padding: 12px 16px;
    border-radius: 18px 18px 4px 18px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.16);
    border: 1px solid #e2e8f0;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 10px;
    cursor: pointer;
    max-width: 260px;
    animation: aiGreetingFade 1s ease;
}

.dark .ai-chat-greeting {
    background: #0f172a;
    color: #f8fafc;
    border-color: #334155;
}

@keyframes aiGreetingFade {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
        /* Điểm báo có tin nhắn/chú ý */
        .ai-chat-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 14px;
            height: 14px;
            background-color: #f7b500;
            border: 2px solid #ffffff;
            border-radius: 50%;
            animation: pulse-gold 2s infinite;
        }
        .dark .ai-chat-badge {
            border-color: #1e293b;
        }

        @keyframes pulse-gold {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(247, 181, 0, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(247, 181, 0, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(247, 181, 0, 0); }
        }

        /* Khung cửa sổ chat */
        .ai-chat-window {
            width: 380px;
            height: 540px;
            max-height: calc(100vh - 100px);
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            margin-bottom: 16px;
            transform: scale(0.9) translateY(20px);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform-origin: bottom right;
        }
        .ai-chat-window.open {
            transform: scale(1) translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
        .dark .ai-chat-window {
            background: #0f172a;
            border-color: #1e293b;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
        }

        /* Header của khung chat */
        .ai-chat-header {
            background: linear-gradient(135deg, #00122e 0%, #003870 50%, #00569e 100%);
            padding: 18px 20px;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            position: relative;
        }
        .ai-chat-header::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at top right, rgba(247, 181, 0, 0.15), transparent 60%);
            pointer-events: none;
        }

        /* Thông tin Trợ lý */
        .ai-assistant-profile {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .ai-assistant-avatar {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #f7b500;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        .ai-assistant-name {
            font-size: 14px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 0.2px;
        }
        .ai-assistant-status {
            font-size: 10px;
            color: #10b981;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 2px;
        }
        .ai-assistant-status::before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 6px;
            background-color: #10b981;
            border-radius: 50%;
            animation: pulse-green 1.5s infinite;
        }
        @keyframes pulse-green {
            0% { transform: scale(0.9); opacity: 0.6; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.6; }
        }

        /* Nút chức năng trên Header */
        .ai-chat-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .ai-chat-header-btn {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.85);
            width: 32px;
            height: 32px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .ai-chat-header-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            transform: translateY(-1px);
        }
        .ai-chat-header-btn.close-btn:hover {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.3);
            color: #f87171;
        }

        /* Khu vực hiển thị tin nhắn */
        .ai-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: #f8fafc;
        }
        .dark .ai-chat-messages {
            background: #0b0f19;
        }

        /* Bong bóng tin nhắn */
        .ai-chat-msg-wrapper {
            display: flex;
            flex-direction: column;
            max-width: 82%;
        }
        .ai-chat-msg-wrapper.bot {
            align-self: flex-start;
        }
        .ai-chat-msg-wrapper.user {
            align-self: flex-end;
            align-items: flex-end;
        }

        .ai-chat-msg-bubble {
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 13px;
            line-height: 1.55;
            font-weight: 500;
            word-break: break-word;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .ai-chat-msg-wrapper.bot .ai-chat-msg-bubble {
            background: #ffffff;
            color: #334155;
            border-bottom-left-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        .dark .ai-chat-msg-wrapper.bot .ai-chat-msg-bubble {
            background: #1e293b;
            color: #cbd5e1;
            border-color: #334155;
        }
        .ai-chat-msg-wrapper.user .ai-chat-msg-bubble {
            background: linear-gradient(135deg, #003c7a 0%, #00569e 100%);
            color: #ffffff;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 10px rgba(0, 86, 158, 0.15);
        }

        /* Định dạng nội dung markdown/danh sách */
        .ai-chat-msg-bubble p {
            margin-bottom: 6px;
        }
        .ai-chat-msg-bubble p:last-child {
            margin-bottom: 0;
        }
        .ai-chat-msg-bubble ul, .ai-chat-msg-bubble ol {
            margin: 6px 0;
            padding-left: 18px;
        }
        .ai-chat-msg-bubble li {
            margin-bottom: 4px;
        }
        .ai-chat-msg-bubble strong {
            font-weight: 700;
            color: inherit;
        }
        .ai-chat-msg-bubble a {
            color: #f7b500;
            text-decoration: underline;
            font-weight: 600;
        }
        .ai-chat-msg-wrapper.user .ai-chat-msg-bubble a {
            color: #ffe066;
        }

        /* Thời gian gửi */
        .ai-chat-msg-time {
            font-size: 9px;
            color: #94a3b8;
            margin-top: 4px;
            font-weight: 600;
        }
        .ai-chat-msg-wrapper.user .ai-chat-msg-time {
            text-align: right;
        }

        /* Bong bóng đang gõ (Typing skeleton) */
        .ai-chat-typing-bubble {
            display: flex;
            gap: 4px;
            padding: 12px 18px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            border-bottom-left-radius: 4px;
            align-self: flex-start;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .dark .ai-chat-typing-bubble {
            background: #1e293b;
            border-color: #334155;
        }
        .ai-chat-typing-dot {
            width: 7px;
            height: 7px;
            background-color: #64748b;
            border-radius: 50%;
            animation: typing-bounce 1.4s infinite ease-in-out both;
        }
        .ai-chat-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .ai-chat-typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing-bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        /* Gợi ý nhanh (Suggestions bar) */
        .ai-chat-suggestions {
            padding: 10px 14px;
            border-top: 1px solid #f1f5f9;
            background: #ffffff;
            display: flex;
            gap: 8px;
            overflow-x: auto;
            white-space: nowrap;
            scrollbar-width: none; /* Firefox */
        }
        .ai-chat-suggestions::-webkit-scrollbar {
            display: none; /* Safari / Chrome */
        }
        .dark .ai-chat-suggestions {
            background: #0f172a;
            border-top-color: #1e293b;
        }
        .ai-chat-suggest-chip {
            padding: 8px 14px;
            background: #f1f5f9;
            color: #334155;
            border-radius: 14px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
            flex-shrink: 0;
        }
        .ai-chat-suggest-chip:hover {
            background: #e2e8f0;
            color: #00569e;
            border-color: rgba(0, 86, 158, 0.15);
        }
        .dark .ai-chat-suggest-chip {
            background: #1e293b;
            color: #cbd5e1;
        }
        .dark .ai-chat-suggest-chip:hover {
            background: #334155;
            color: #f7b500;
            border-color: rgba(247, 181, 0, 0.15);
        }

        /* Form nhập tin nhắn */
        .ai-chat-input-form {
            padding: 14px 20px;
            border-top: 1px solid #e2e8f0;
            background: #ffffff;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .dark .ai-chat-input-form {
            background: #0f172a;
            border-top-color: #1e293b;
        }
        .ai-chat-input {
            flex: 1;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            border-radius: 14px;
            padding: 10px 16px;
            font-size: 12px;
            font-weight: 500;
            outline: none;
            transition: all 0.2s;
            color: #1e293b;
        }
        .ai-chat-input:focus {
            border-color: #00569e;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(0, 86, 158, 0.1);
        }
        .dark .ai-chat-input {
            border-color: #334155;
            background: #1e293b/40;
            color: #f1f5f9;
        }
        .dark .ai-chat-input:focus {
            border-color: #f7b500;
            background: #1e293b;
            box-shadow: 0 0 0 3px rgba(247, 181, 0, 0.1);
        }
        .ai-chat-send-btn {
            width: 36px;
            height: 36px;
            border-radius: 12px;
            background: #00569e;
            color: #ffffff;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        .ai-chat-send-btn:hover {
            background: #00407a;
            transform: scale(1.04);
        }
        .ai-chat-send-btn:disabled {
            background: #cbd5e1;
            color: #94a3b8;
            cursor: not-allowed;
            transform: none;
        }
        .dark .ai-chat-send-btn {
            background: #f7b500;
            color: #0f172a;
        }
        .dark .ai-chat-send-btn:hover {
            background: #e0a300;
        }
        .dark .ai-chat-send-btn:disabled {
            background: #1e293b;
            color: #475569;
        }

        /* Scrollbar tùy chỉnh */
        .ai-chat-messages::-webkit-scrollbar {
            width: 5px;
        }
        .ai-chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }
        .ai-chat-messages::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        .dark .ai-chat-messages::-webkit-scrollbar-thumb {
            background: #334155;
        }
        
        /* Hiển thị ẩn hiện trên Mobile */
        @media (max-width: 480px) {
            .ai-chat-window {
                width: calc(100vw - 32px);
                height: 480px;
                right: 16px;
                bottom: 80px;
                position: fixed;
            }
            .ai-chat-widget {
                bottom: 16px;
                right: 16px;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Định nghĩa câu trả lời mẫu chuyên nghiệp (Demo Responses Database)
    const responses = {
        "mơ tai khoan": "Để mở tài khoản tại GT SmartBank, bạn có thể thực hiện theo 2 cách:\n\n1. **Trực tuyến (eKYC)**: Tải ứng dụng GT SmartBank về điện thoại, chọn **Mở tài khoản**, chụp hình CCCD/CMND hai mặt và quét khuôn mặt sinh trắc học để sở hữu tài khoản số đẹp miễn phí chỉ sau 2 phút.\n2. **Tại phòng giao dịch**: Bạn chỉ cần mang theo CCCD bản gốc đến chi nhánh/phòng giao dịch GT SmartBank gần nhất để được giao dịch viên hỗ trợ mở trực tiếp tại quầy.",
        
        "chuyen tien": "GT SmartBank hỗ trợ chuyển tiền trực tuyến **hoàn toàn miễn phí 24/7**. Các bước thực hiện:\n\n1. Đăng nhập và chọn mục **Chuyển tiền** trên Menu thanh điều hướng bên trái.\n2. Chọn phương thức chuyển khoản: **Nội bộ** hoặc **Liên ngân hàng nhanh 24/7**.\n3. Nhập số tài khoản/số thẻ thụ hưởng, lựa chọn ngân hàng nhận và điền số tiền cần chuyển.\n4. Xác nhận thông tin giao dịch, nhập mã xác thực OTP/Smart OTP gửi về điện thoại để hoàn tất chuyển khoản.",
        
        "chi nhanh": "Bạn có thể tra cứu toàn bộ mạng lưới chi nhánh và cây ATM trên bản đồ số trực quan bằng cách nhấp chọn danh mục **Chi nhánh & ATM** ở thanh điều hướng bên trái, hoặc truy cập trực tiếp liên kết công khai: [Chi nhánh & ATM](/bank-ui/pages/chi-nhanh-atm.html).\n\nHệ thống sẽ hiển thị danh sách, thông tin liên lạc, giờ làm việc chi tiết và liên kết Chỉ đường đi qua Google Maps cho từng địa điểm.",
        
        "tiêt kiêm": "GT SmartBank cung cấp các gói gửi tiết kiệm online có mức lãi suất hấp dẫn vượt trội lên tới **6.5%/năm**. Quy trình gửi:\n\n1. Truy cập mục **Sổ tiết kiệm** ở thanh điều hướng trái.\n2. Nhập số tiền gửi (tối thiểu **1.000.000 VND**) và lựa chọn kỳ hạn mong muốn từ **1 đến 24 tháng**.\n3. Lựa chọn phương thức đáo hạn: *Tự động tái tục cả gốc và lãi*, *Tái tục gốc*, hoặc *Tất toán gốc lãi về tài khoản* khi hết hạn.\n4. Thực hiện xác thực OTP để khởi tạo sổ tiết kiệm online thành công.",
        
        "khoa the": "Trong trường hợp khẩn cấp (mất thẻ, nghi ngờ lộ mã PIN, giao dịch bất thường), bạn cần thực hiện khóa thẻ khẩn cấp:\n\n1. **Cách nhanh nhất**: Gọi ngay tới số Hotline Hỗ trợ Khách hàng 24/7: **1800 9999** (Cuộc gọi hoàn toàn miễn phí).\n2. **Cách 2**: Đăng nhập vào hệ thống ngân hàng điện tử, truy cập mục **Hỗ trợ** trên thanh điều hướng để gửi yêu cầu hỗ trợ trực tuyến khóa thẻ tức thì.\n3. **Cách 3**: Mang CCCD đến điểm giao dịch GT SmartBank gần nhất để được nhân viên hỗ trợ trực tiếp."
    };

    // Hàm phân tích từ khóa tin nhắn của người dùng để chọn câu trả lời tương ứng
    function getAiResponse(userText) {
    const text = removeVietnameseTones(userText.toLowerCase());

    if (text.includes("so du")) {
        return "Bạn có thể kiểm tra số dư tại mục Tài khoản. Hệ thống sẽ hiển thị số tài khoản, loại tài khoản và số dư khả dụng.";
    }

    if (text.includes("mo") && text.includes("tai khoan") || text.includes("mo tk") || text.includes("reg") || text.includes("create")) {
        return responses["mơ tai khoan"];
    }

    if (text.includes("chuyen tien") || text.includes("chuyen khoan") || text.includes("gui tien") || text.includes("transfer")) {
        return responses["chuyen tien"];
    }

    if (text.includes("chi nhanh") || text.includes("atm") || text.includes("ban do") || text.includes("map") || text.includes("dia chi")) {
        return responses["chi nhanh"];
    }

    if (text.includes("tiet kiem") || text.includes("gui tiet kiem") || text.includes("lai suat") || text.includes("saving")) {
        return responses["tiêt kiêm"];
    }

    if (text.includes("khoa the") || text.includes("mat the") || text.includes("lock")) {
        return responses["khoa the"];
    }

    if (text.includes("hello") || text.includes("hi") || text.includes("xin chao") || text.includes("chao")) {
        return "Xin chào! Tôi là trợ lý ảo GT SmartBank. Tôi có thể giúp gì cho bạn hôm nay?";
    }

    return "Tôi là Trợ lý số GT SmartBank. Hiện tại tôi chưa hiểu rõ yêu cầu này. Bạn vui lòng chọn gợi ý nhanh bên dưới hoặc gọi Hotline **1800 9999** để được hỗ trợ nhé!";
}

        // Câu trả lời mặc định nếu không khớp từ khóa
        return "Tôi là Trợ lý số GT SmartBank. Hiện tại tôi chưa hiểu rõ yêu cầu này. Bạn vui lòng sử dụng các gợi ý nhanh bên dưới hoặc liên hệ tổng đài hỗ trợ 24/7 qua số Hotline **1800 9999** để được giúp đỡ nhé!";
    }

    // Xóa dấu tiếng Việt
    function removeVietnameseTones(str) {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|ã|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|á|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        return str;
    }

    // 3. Khởi tạo cấu trúc HTML của Chatbot
    const chatbotHtml = `
        <div class="ai-chat-widget" id="aiChatWidget">
            <!-- Khung Chat Window -->
            <div class="ai-chat-window" id="aiChatWindow">
                <!-- Header -->
                <div class="ai-chat-header">
                    <div class="ai-assistant-profile">
                        <div class="ai-assistant-avatar">
                            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-4 4v5a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-5a4 4 0 0 0-4-4V7a5 5 0 0 0-5-5zm-3 6V7a3 3 0 0 1 6 0v1H9zm1 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm4 4.5H10v-1h4v1z"/></svg>
                        </div>
                        <div>
                            <div class="ai-assistant-name">GT SmartBot</div>
                            <div class="ai-assistant-status">Đang trực tuyến</div>
                        </div>
                    </div>
                    <div class="ai-chat-header-actions">
                        <button class="ai-chat-header-btn" title="Xóa lịch sử" onclick="window.clearChatHistory()">
                            <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:currentColor;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                        <button class="ai-chat-header-btn close-btn" title="Đóng" onclick="window.toggleChatWindow()">
                            <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:currentColor;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Messages Container -->
                <div class="ai-chat-messages" id="aiChatMessages">
                    <!-- Sẽ chèn tin nhắn bằng JS -->
                </div>

                <!-- Suggestions Container -->
                <div class="ai-chat-suggestions" id="aiChatSuggestions">
                    <div class="ai-chat-suggest-chip" onclick="window.handleSuggestClick('Hướng dẫn mở tài khoản')">Mở tài khoản</div>
                    <div class="ai-chat-suggest-chip" onclick="window.handleSuggestClick('Cách chuyển tiền')">Chuyển tiền</div>
                    <div class="ai-chat-suggest-chip" onclick="window.handleSuggestClick('Tra cứu chi nhánh/ATM')">ATM/Chi nhánh</div>
                    <div class="ai-chat-suggest-chip" onclick="window.handleSuggestClick('Hướng dẫn gửi tiết kiệm')">Gửi tiết kiệm</div>
                    <div class="ai-chat-suggest-chip" onclick="window.handleSuggestClick('Hỗ trợ khóa thẻ')">Khóa thẻ</div>
                </div>

                <!-- Input Form -->
                <form class="ai-chat-input-form" id="aiChatInputForm" onsubmit="window.handleChatSubmit(event)">
                    <input type="text" class="ai-chat-input" id="aiChatInput" placeholder="Nhập tin nhắn..." autocomplete="off" oninput="window.handleInputCheck()">
                    <button type="submit" class="ai-chat-send-btn" id="aiChatSendBtn" disabled>
                        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:currentColor;transform:rotate(45deg);"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </form>
            </div>

   <!-- Bubble lời chào -->
<div class="ai-chat-greeting" id="aiChatGreeting" onclick="window.toggleChatWindow()">
    Xin chào, tôi là trợ lý GT SmartBank 👋
</div>

<!-- Nút bấm nổi kích hoạt Chatbot -->
<button class="ai-chat-trigger" id="aiChatTrigger" onclick="window.toggleChatWindow()">
    <div class="ai-chat-badge" id="aiChatBadge"></div>
    <svg viewBox="0 0 24 24" class="w-7 h-7 fill-current">
        <path d="M12 2a1 1 0 0 1 1 1v1h3a3 3 0 0 1 3 3v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h3V3a1 1 0 0 1 1-1Zm-4 8.5A1.5 1.5 0 1 0 11 10.5A1.5 1.5 0 0 0 8 10.5Zm5 0A1.5 1.5 0 1 0 16 10.5A1.5 1.5 0 0 0 13 10.5ZM9 15h6v-1H9v1Z"/>
    </svg>
</button>
    `;

    // 4. Inject cấu trúc DOM Chatbot vào body
    document.body.insertAdjacentHTML("beforeend", chatbotHtml);

    // Lưu trữ các DOM references
    const widgetWindow = document.getElementById("aiChatWindow");
    const messagesBox = document.getElementById("aiChatMessages");
    const inputField = document.getElementById("aiChatInput");
    const sendButton = document.getElementById("aiChatSendBtn");
    const attentionBadge = document.getElementById("aiChatBadge");

    // Lịch sử tin nhắn khởi tạo
    let chatHistory = [];

    // Tải lịch sử tin nhắn từ localStorage
    function loadHistory() {
        const stored = localStorage.getItem("gt_chat_history");
        if (stored) {
            try {
                chatHistory = JSON.parse(stored);
            } catch (e) {
                chatHistory = [];
            }
        }
        
        // Nếu lịch sử rỗng, nạp câu chào mừng mặc định
        if (chatHistory.length === 0) {
            chatHistory.push({
                sender: "bot",
                text: "Xin chào, tôi là trợ lý ảo GT SmartBank. Tôi có thể giúp gì cho bạn hôm nay?",
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            });
            saveHistory();
        }

        renderMessages();
    }

    // Lưu lịch sử vào localStorage
    function saveHistory() {
        localStorage.setItem("gt_chat_history", JSON.stringify(chatHistory));
    }

    // Vẽ toàn bộ các bong bóng tin nhắn trong lịch sử
    function renderMessages() {
        messagesBox.innerHTML = "";
        chatHistory.forEach(msg => {
            const wrapper = document.createElement("div");
            wrapper.className = `ai-chat-msg-wrapper ${msg.sender}`;
            
            // Format đơn giản cho các đoạn markdown mô phỏng
            let formattedText = msg.text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

            wrapper.innerHTML = `
                <div class="ai-chat-msg-bubble">${formattedText}</div>
                <div class="ai-chat-msg-time">${msg.time}</div>
            `;
            messagesBox.appendChild(wrapper);
        });
        scrollToBottom();
    }

    // Tự động cuộn xuống cuối khung tin nhắn
    function scrollToBottom() {
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    // 5. Các hàm Global đăng ký vào window để gọi từ các sự kiện HTML onclick/onsubmit

    // Đóng mở cửa sổ chat
    window.toggleChatWindow = function() {

    const greeting = document.getElementById("aiChatGreeting");

    if (greeting) {
        greeting.style.display = "none";
    }

    widgetWindow.classList.toggle("open");

    if (widgetWindow.classList.contains("open")) {
        attentionBadge.style.display = "none";

        if (inputField) {
            inputField.focus();
        }

        scrollToBottom();
    }
};

    // Kiểm tra và bật/tắt nút gửi tin
    window.handleInputCheck = function() {
        sendButton.disabled = inputField.value.trim() === "";
    };

    // Xử lý gửi tin nhắn của User
    window.handleChatSubmit = function(e) {
        if (e) e.preventDefault();
        const text = inputField.value.trim();
        if (!text) return;

        // Reset input field
        inputField.value = "";
        sendButton.disabled = true;

        // 1. Thêm tin nhắn của User
        const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        chatHistory.push({
            sender: "user",
            text: text,
            time: timeNow
        });
        renderMessages();
        saveHistory();

        // 2. Thêm hiệu ứng gõ tin nhắn của Bot
        showTypingIndicator();

        // 3. Phản hồi tự động sau 1.2s giả lập
        setTimeout(() => {
            removeTypingIndicator();
            const botAnswer = getAiResponse(text);
            chatHistory.push({
                sender: "bot",
                text: botAnswer,
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            });
            renderMessages();
            saveHistory();
        }, 1200);
    };

    // Xử lý khi nhấp vào Gợi ý nhanh
    window.handleSuggestClick = function(suggestText) {
        // Nhập trực tiếp gợi ý và tự động gửi
        inputField.value = suggestText;
        window.handleInputCheck();
        window.handleChatSubmit();
    };

    // Xóa lịch sử trò chuyện
    window.clearChatHistory = function() {
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử cuộc trò chuyện với Trợ lý ảo?")) {
            localStorage.removeItem("gt_chat_history");
            chatHistory = [];
            loadHistory();
        }
    };

    // Hiển thị bong bóng typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "ai-chat-typing-bubble";
        typingDiv.id = "aiChatTypingIndicator";
        typingDiv.innerHTML = `
            <div class="ai-chat-typing-dot"></div>
            <div class="ai-chat-typing-dot"></div>
            <div class="ai-chat-typing-dot"></div>
        `;
        messagesBox.appendChild(typingDiv);
        scrollToBottom();
    }

    // Xóa bong bóng typing
    function removeTypingIndicator() {
        const indicator = document.getElementById("aiChatTypingIndicator");
        if (indicator) {
            indicator.remove();
        }
    }

    // 6. Tải dữ liệu ban đầu
    loadHistory();
})();
