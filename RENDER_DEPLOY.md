# Hướng dẫn Triển khai Backend ASP.NET Core lên Render bằng Docker

Tài liệu này hướng dẫn các bước chi tiết để đóng gói và triển khai phần Backend Web API của GT Smart Bank lên Render sử dụng Docker.

---

## ⚠️ Lưu ý quan trọng về Cơ sở dữ liệu (Database)

Ứng dụng hiện tại đang sử dụng SQL Server LocalDB/cục bộ. Khi triển khai lên môi trường đám mây (Render):
1. **Không thể sử dụng LocalDB**: LocalDB không chạy được trong Docker Container trên môi trường Cloud.
2. **Giải pháp**: Bạn cần sử dụng một cơ sở dữ liệu SQL Server trực tuyến (ví dụ: Azure SQL Database, AWS RDS, CockroachDB hoặc SQL Server được cài trên một dịch vụ VPS/Cloud khác).
3. **Chuỗi kết nối**: Chuỗi kết nối đến cơ sở dữ liệu cloud này sẽ được cung cấp dưới dạng Biến môi trường (Environment Variable) trên Render mà không cần sửa đổi mã nguồn.

---

## 🛠️ Các bước triển khai lên Render

### Bước 1: Chuẩn bị mã nguồn trên GitHub
1. Tạo một kho lưu trữ (repository) riêng tư hoặc công khai trên GitHub.
2. Đẩy toàn bộ mã nguồn của dự án (bao gồm tệp `Dockerfile` ở thư mục gốc) lên repository đó.

### Bước 2: Tạo Web Service mới trên Render
1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com).
2. Nhấn nút **New** > **Web Service**.
3. Kết nối tài khoản GitHub của bạn và chọn repository chứa dự án GT Smart Bank.
4. Trong màn hình thiết lập Web Service:
   - **Name**: Nhập tên dịch vụ (ví dụ: `gtsmartbank-api`). Tên miền sẽ tự động được cấp dưới dạng `gtsmartbank-api.onrender.com`.
   - **Region**: Chọn vùng gần Việt Nam nhất (ví dụ: `Singapore` hoặc `Oregon`).
   - **Branch**: Chọn nhánh của repository (thường là `main` hoặc `master`).
   - **Runtime**: Chọn **Docker** (Render sẽ tự động đọc file `Dockerfile` của bạn để build).
   - **Instance Type**: Chọn gói **Free** hoặc gói trả phí tùy theo nhu cầu.

### Bước 3: Cấu hình biến môi trường (Environment Variables)
Để ứng dụng kết nối tới Database và bảo mật khóa JWT, bạn cần định cấu hình các biến môi trường trong phần **Environment** trên Render:

| Key | Value (Ví dụ) | Mô tả |
| :--- | :--- | :--- |
| `ConnectionStrings__DefaultConnection` | `Server=sql.example.com;Database=GTSmartBank;User Id=sa;Password=your_secure_password;TrustServerCertificate=True;` | Chuỗi kết nối tới SQL Server trực tuyến |
| `Jwt__Key` | `GTSmartBankSecretKey123456789ABCDEF_SECURE` | Khóa bảo mật JWT (Độ dài tối thiểu 32 ký tự) |
| `Jwt__Issuer` | `GTSmartBank` | Tên bên phát hành token |
| `Jwt__Audience` | `GTSmartBankUser` | Đối tượng sử dụng token |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Chạy ứng dụng dưới môi trường Producton |

> [!NOTE]
> ASP.NET Core sử dụng dấu gạch dưới kép (`__`) để thay thế cho dấu hai chấm (`:`) trong tệp cấu hình JSON khi đọc biến môi trường.

### Bước 4: Triển khai và Kiểm tra
1. Nhấn nút **Create Web Service** ở cuối trang thiết lập.
2. Render sẽ tự động tải mã nguồn, build Docker image và chạy container. Quá trình này có thể mất từ 3 - 5 phút ở lần triển khai đầu tiên.
3. Khi dịch vụ báo trạng thái **Live**, bạn có thể truy cập kiểm tra API tại:
   `https://gtsmartbank-api.onrender.com/swagger/index.html` (Nếu môi trường chạy được thiết lập cho phép xem Swagger, hoặc kiểm tra qua các endpoint như `https://gtsmartbank-api.onrender.com/api/auth`).
