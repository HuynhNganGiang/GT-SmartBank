# Hướng dẫn Triển khai Frontend GT Smart Bank lên Vercel

Tài liệu này hướng dẫn cách triển khai phần Frontend tĩnh (HTML/CSS/JS) của ứng dụng GT Smart Bank lên nền tảng đám mây Vercel một cách độc lập.

## 🚀 Chuẩn bị trước khi triển khai

1. Một tài khoản [Vercel](https://vercel.com).
2. [Vercel CLI](https://vercel.com/cli) đã cài đặt trên máy tính (nếu muốn triển khai bằng dòng lệnh) hoặc mã nguồn đã được đẩy lên một kho lưu trữ Git (GitHub, GitLab, Bitbucket).
3. Đảm bảo Backend API đã được triển khai và đang hoạt động tại địa chỉ: `https://gtsmartbank-api.onrender.com`.

---

## 🛠️ Các bước triển khai

### Cách 1: Triển khai nhanh qua GitHub (Khuyên dùng)

1. Tạo một kho lưu trữ (repository) mới trên GitHub (ví dụ: `gtsmartbank-frontend`).
2. Đẩy toàn bộ mã nguồn trong thư mục `frontend/` này lên repository đó.
3. Truy cập vào trang quản trị Vercel Dashboard của bạn.
4. Nhấn **Add New** > **Project**.
5. Chọn repository `gtsmartbank-frontend` bạn vừa đẩy lên.
6. Trong phần cấu hình dự án:
   - **Framework Preset**: Chọn `Other` hoặc `None` (Vercel tự nhận diện là dự án tĩnh).
   - **Root Directory**: Để mặc định (nếu repository chỉ chứa các file của thư mục này), hoặc chọn thư mục chứa các file giao diện.
7. Nhấn nút **Deploy**.
8. Vercel sẽ tự động build và cấp cho bạn tên miền miễn phí dạng `*.vercel.app` (Ví dụ: `gtsmartbank.vercel.app`).

### Cách 2: Triển khai bằng Vercel CLI (Dòng lệnh)

1. Mở cửa sổ terminal trong thư mục `frontend/`.
2. Đăng nhập vào tài khoản Vercel của bạn thông qua dòng lệnh:
   ```bash
   vercel login
   ```
3. Chạy lệnh để khởi tạo và triển khai dự án:
   ```bash
   vercel
   ```
   *Làm theo các chỉ dẫn trên màn hình (chọn Yes cho các thiết lập mặc định).*
4. Để triển khai lên môi trường Production (chính thức), chạy lệnh:
   ```bash
   vercel --prod
   ```

---

## ⚙️ Chi tiết file cấu hình `vercel.json`

File `vercel.json` đã được tạo sẵn trong thư mục này với nội dung:
```json
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false
}
```
- **cleanUrls**: Cho phép truy cập các trang mà không cần phần mở rộng `.html` (Ví dụ: truy cập `https://gtsmartbank.vercel.app/pages/login` thay vì `.../pages/login.html`).
- **trailingSlash**: Tự động dọn dẹp dấu gạch chéo `/` ở cuối URL để tăng tính thống nhất cho SEO và định tuyến.
