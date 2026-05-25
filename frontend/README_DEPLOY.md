# Hướng dẫn Triển khai Frontend GT SmartBank lên Netlify (gtsmartbank.io.vn)

Tài liệu này hướng dẫn cách cấu hình và triển khai giao diện tĩnh (HTML/CSS/JS) của dự án **GT SmartBank** từ thư mục `frontend/` lên nền tảng **Netlify** với tên miền tự chọn `gtsmartbank.io.vn`.

---

## 🛠️ Bước 1: Kiểm tra cấu hình API
Trước khi triển khai, hãy đảm bảo rằng API của bạn đã được cấu hình chính xác trong file [frontend/js/config.js](file:///d:/GTSmartBank/frontend/js/config.js):
```javascript
const CONFIG = {
    // Trỏ tới URL API backend chính thức (ví dụ: Render hoặc máy chủ IIS riêng)
    API_BASE_URL: "https://gtsmartbank-api.onrender.com/api"
};
```
*Lưu ý: Khi chạy phát triển ở máy cục bộ (development), bạn có thể đổi giá trị này thành `http://localhost:5232/api`.*

---

## 🚀 Bước 2: Các cách Triển khai lên Netlify

### Cách 1: Sử dụng Netlify Drop (Kéo & Thả - Nhanh nhất)
1. Đăng nhập vào trang quản trị [Netlify Dashboard](https://app.netlify.com).
2. Truy cập vào mục **Sites**.
3. Kéo toàn bộ thư mục `frontend/` (chỉ kéo các file *bên trong* thư mục này, bao gồm `index.html`, các thư mục `pages`, `js`, `css`, `admin`, `netlify.toml`) và thả vào vùng **"Drag and drop your site folder here"** ở cuối trang.
4. Netlify sẽ tự động tải lên và kích hoạt dự án trong vài giây.

### Cách 2: Triển khai qua GitHub/GitLab (Khuyên dùng cho liên tục)
1. Tạo một repository mới trên GitHub (ví dụ: `gtsmartbank-frontend`).
2. Đẩy toàn bộ mã nguồn bên trong thư mục `frontend/` này lên repository đó.
3. Trên Netlify Dashboard, chọn **Add new site** > **Import an existing project**.
4. Kết nối tài khoản GitHub của bạn và chọn repository `gtsmartbank-frontend`.
5. Thiết lập cấu hình build:
   - **Build command**: Để trống (vì đây là trang HTML tĩnh, không cần build).
   - **Publish directory**: `.` (hoặc để trống để xuất bản thư mục gốc).
6. Nhấp **Deploy site**. Netlify sẽ tự động triển khai và tự cập nhật mỗi khi bạn đẩy code mới lên GitHub.

---

## 🌐 Bước 3: Cấu hình Tên miền Custom `gtsmartbank.io.vn`

Sau khi trang web đã được deploy thành công và nhận một URL ngẫu nhiên dạng `*.netlify.app`:

1. Tại dashboard dự án trên Netlify, truy cập vào **Site configuration** > **Domain management** > **Custom domains**.
2. Nhấn nút **Add custom domain**.
3. Nhập tên miền của bạn: `gtsmartbank.io.vn` và nhấn **Verify** > **Add domain**.
4. Netlify sẽ hướng dẫn bạn cấu hình bản ghi DNS. Bạn cần truy cập vào trang quản lý nhà cung cấp tên miền của mình và thiết lập:
   - **Bản ghi CNAME** cho `www.gtsmartbank.io.vn` trỏ tới địa chỉ trang web Netlify của bạn (ví dụ: `gtsmartbank-xxx.netlify.app`).
   - Hoặc **Bản ghi A** cho `gtsmartbank.io.vn` trỏ tới địa chỉ IP của Netlify: `75.2.60.5` (Địa chỉ IP chung của máy chủ Netlify).
5. Sau khi lưu cấu hình DNS, có thể mất từ vài phút đến vài giờ để DNS cập nhật toàn cầu.
6. Khi DNS đã nhận diện, quay lại mục **Domain management** trên Netlify, kéo xuống phần **HTTPS** và nhấn **Verify DNS configuration** để Netlify tự động cấp chứng chỉ bảo mật SSL miễn phí từ **Let's Encrypt**.

---

## ⚙️ Cấu hình Tối ưu hóa trên Netlify (Pretty URLs)
Để URL hiển thị đẹp hơn (ví dụ: truy cập `https://gtsmartbank.io.vn/pages/login` thay vì phải gõ `.html` ở đuôi):
1. Vào **Site configuration** > **Build & deploy** > **Post processing** > **Asset optimization**.
2. Tích chọn **Pretty URLs**.
3. Nhấn **Save**. Netlify sẽ tự động xử lý ẩn đuôi `.html` khi người dùng truy cập.

*Mọi quy tắc chuyển hướng tương thích ngược từ đường dẫn cũ `/bank-ui/*` sang `/` đã được tự động áp dụng qua file `netlify.toml` đi kèm.*
