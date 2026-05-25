# 🏦 GT Smart Bank — Hệ thống Ngân hàng điện tử thông minh thế hệ mới
> Hệ thống quản lý ngân hàng trực tuyến (Internet Banking) bảo mật, hiệu năng cao và giao diện Premium đột phá.

Hệ thống **GT Smart Bank** là giải pháp ngân hàng điện tử toàn diện được xây dựng trên nền tảng **ASP.NET Core 8.0 Web API** ở Backend và **Vanilla Web UI (HTML5/CSS3/JS)** ở Frontend. Dự án được tách biệt hoàn toàn theo kiến trúc decoupled hiện đại, sẵn sàng triển khai trên hạ tầng đám mây **Vercel** (Frontend) và **Render** (Backend API).

---

## 🏛️ Kiến trúc hệ thống (Decoupled Architecture)

Hệ thống được thiết kế theo kiến trúc tách rời (Decoupled) để tối ưu hóa khả năng mở rộng, bảo trì và triển khai độc lập:

```text
                      ┌────────────────────────────────────────┐
                      │          FRONTEND (Vercel)             │
                      │      gtsmartbank.vercel.app            │
                      └───────────────────┬────────────────────┘
                                          │
                                   HTTPS (RESTful API)
                                          │
                      ┌───────────────────▼────────────────────┐
                      │          BACKEND (Render)              │
                      │     gtsmartbank-api.onrender.com       │
                      │          (Docker Container)            │
                      └───────────────────┬────────────────────┘
                                          │
                                    EF Core (TCP)
                                          │
                      ┌───────────────────▼────────────────────┐
                      │            DATABASE CLOUD              │
                      │           (SQL Server Cloud)           │
                      └────────────────────────────────────────┘
```

- **Frontend (Vercel)**: Ứng dụng client tĩnh (Static Web App) tối ưu hóa SEO, phân phối toàn cầu qua CDN của Vercel để đạt tốc độ tải trang dưới 1 giây.
- **Backend (Render)**: Web API được container hóa bằng Docker, chạy trên nền Linux của Render, tự động khởi động và scale theo lượng truy cập.
- **CORS Configuration**: Hệ thống chỉ cho phép các yêu cầu an toàn từ Domain Vercel được chỉ định truy cập vào API Backend, ngăn ngừa mọi cuộc tấn công CORS & CSRF chéo nguồn.

---

## 🛠️ Công nghệ sử dụng (Technology Stack)

### 💻 Frontend
- **Cốt lõi**: HTML5, Vanilla CSS (Custom variables), Modern JavaScript (ES6+).
- **Styling**: Tailwind CSS (CDN) hỗ trợ Responsive hoàn hảo trên Desktop, Tablet và Mobile.
- **Biểu đồ**: Chart.js cho các báo cáo trực quan về biến động số dư và giao dịch.
- **Aesthetics**: Premium Glassmorphism (giao diện kính mờ), font chữ Outfit hiện đại và bộ icon SVG tự tùy chỉnh.

### ⚙️ Backend
- **Framework**: .NET 8.0 (ASP.NET Core Web API).
- **ORM & Database**: Entity Framework Core, kết nối cơ sở dữ liệu Microsoft SQL Server.
- **Bảo mật**: JWT Authentication (Access Token & Refresh Token) & Khóa băm mật khẩu bảo mật.
- **Định dạng dữ liệu**: Chuẩn dữ liệu trả về thống nhất `ApiResponse<T>`.
- **Tài liệu**: Swagger UI chuẩn OpenAPI 3.0.

---

## 🔑 Bảo mật & Xác thực (JWT & OTP)

### 1. Luồng xác thực JWT Authentication
```
[Client] --- (Đăng nhập: SĐT + Mật khẩu) ---> [Backend API]
[Client] <--- (Cấp Access Token + Refresh Token) --- [Backend API]
[Client] --- (Gửi Request + Header Authorization: Bearer <Token>) ---> [Backend API]
```
- **Access Token**: Có hiệu lực ngắn hạn, dùng để ký và xác thực tất cả các yêu cầu bảo mật.
- **Refresh Token**: Lưu trữ trong cơ sở dữ liệu để cấp lại Access Token mới khi hết hạn mà không bắt người dùng đăng nhập lại.
- **Phân quyền người dùng**: Phân cấp rõ ràng giữa `Admin` (Quản lý khách hàng, mở tài khoản, mạng lưới chi nhánh) và `User` (Thực hiện giao dịch, chuyển tiền, mở sổ tiết kiệm).

### 2. Luồng giao dịch an toàn với OTP
Mọi giao dịch chuyển tiền đều bắt buộc đi qua 2 bước:
1. **Sinh mã OTP**: Hệ thống tạo mã OTP 6 chữ số ngẫu nhiên gửi về Lịch sử OTP của khách hàng (hiệu lực 180 giây).
2. **Xác thực OTP**: Khách hàng nhập mã OTP để xác nhận giao dịch. Nếu khớp, hệ thống mới tiến hành trừ tiền tài khoản nguồn và cộng tiền tài khoản đích trong một Database Transaction duy nhất (đảm bảo tính toàn vẹn dữ liệu).

---

## ⚡ Danh sách API Endpoints (Swagger API)

Hệ thống cung cấp Swagger UI đầy đủ tài liệu API trực quan tại `/swagger/index.html`.

| Nhóm API | Endpoint | HTTP | Auth | Quyền | Mô tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | `POST` | Không | Mọi người | Đăng nhập hệ thống, trả về Token |
| | `/api/auth/refresh` | `POST` | Không | Mọi người | Tạo Access Token mới qua Refresh Token |
| **Khách hàng** | `/api/customers` | `GET` | **Có** | Admin | Xem toàn bộ danh sách khách hàng |
| | `/api/customers/{id}` | `GET` | **Có** | Admin/Chính chủ | Xem chi tiết thông tin một khách hàng |
| | `/api/customers` | `POST` | **Có** | Admin | Thêm mới một khách hàng |
| **Tài khoản** | `/api/accounts` | `POST` | **Có** | Admin | Mở tài khoản thanh toán cho khách hàng |
| | `/api/accounts/{id}` | `GET` | **Có** | Admin/Chính chủ | Xem thông tin chi tiết số dư tài khoản |
| **Tiết kiệm** | `/api/savings-accounts` | `POST` | **Có** | Mọi người | Mở sổ tiết kiệm trực tuyến |
| | `/api/savings-accounts/{id}/settle-early` | `POST` | **Có** | Mọi người | Tất toán sổ tiết kiệm trước hạn |
| **Giao dịch** | `/api/transactions/transfer` | `POST` | **Có** | Mọi người | Chuyển khoản nội bộ (Xác thực OTP) |
| **OTP** | `/api/otps/generate` | `POST` | **Có** | Mọi người | Yêu cầu tạo mã OTP mới |

---

## 💻 Hướng dẫn chạy thử nghiệm cục bộ (Local Run)

### 1. Khôi phục cơ sở dữ liệu
1. Mở SQL Server Management Studio (SSMS).
2. Tạo mới Database mang tên `GTSmartBank`.
3. Chạy toàn bộ file script [database.sql](file:///d:/GTSmartBank/database.sql) để tạo bảng và nạp dữ liệu demo.

### 2. Cấu hình Backend
Mở file [appsettings.json](file:///d:/GTSmartBank/appsettings.json) và điều chỉnh chuỗi kết nối:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=GTSmartBank;User Id=sa;Password=123456;TrustServerCertificate=True;"
}
```

### 3. Chạy Backend API
Mở terminal tại thư mục gốc và chạy lệnh:
```bash
dotnet build
dotnet run
```
Backend API sẽ khởi động tại địa chỉ: `http://localhost:5232`. Swagger UI tại `http://localhost:5232/swagger`.

### 4. Chạy Frontend
Bạn có thể mở giao diện bằng cách:
- Truy cập thẳng `http://localhost:5232/bank-ui/index.html` (phục vụ từ Web Server ASP.NET Core).
- Hoặc mở thư mục `frontend/` độc lập bằng bất kỳ máy chủ tĩnh nào (như Live Server của VS Code) tại địa chỉ `http://localhost:5500/index.html`.

---

## ☁️ Hướng dẫn triển khai đám mây (Cloud Deploy)

### 1. Triển khai Frontend lên Vercel
1. Đưa mã nguồn trong thư mục `frontend/` lên một repository GitHub mới.
2. Đăng nhập vào **Vercel** và Import repository này.
3. Vercel sẽ tự động đọc file `vercel.json` định cấu hình Routing và xuất bản trang của bạn lên tên miền dạng `https://your-app.vercel.app`.

> [!TIP]
> Chi tiết hướng dẫn xem tại [README.md trong thư mục frontend](file:///d:/GTSmartBank/frontend/README.md).

### 2. Triển khai Backend lên Render bằng Docker
1. Đẩy toàn bộ mã nguồn của dự án (chứa tệp `Dockerfile` ở gốc) lên một repo GitHub.
2. Tạo một **Web Service** mới trên Render, chọn repository của bạn.
3. Chọn môi trường chạy là **Docker** (Render sẽ tự build và run Dockerfile).
4. Cấu hình các biến môi trường trong phần **Environment**:
   - `ConnectionStrings__DefaultConnection`: Chuỗi kết nối tới database đám mây.
   - `Jwt__Key`: Khóa bí mật JWT (tối thiểu 32 ký tự).
   - `ASPNETCORE_ENVIRONMENT`: `Production`

> [!TIP]
> Chi tiết hướng dẫn triển khai xem tại [RENDER_DEPLOY.md ở thư mục gốc](file:///d:/GTSmartBank/RENDER_DEPLOY.md).

---

## 🖼️ Hình ảnh giao diện ứng dụng (UI Screenshots)

Dưới đây là một số hình ảnh về giao diện hiện đại phong cách Sacombank của **GT Smart Bank**:

### 📈 Trang chủ Dashboard Cá nhân (Dark Mode & Light Mode)
![GT Smart Bank Dashboard](images/screenshot_dashboard.jpg)
> Giao diện trang chủ dạng ngang cao cấp, hiển thị biểu đồ phân tích tài sản và các phím tắt dịch vụ nhanh chóng.

### 💰 Tính năng gửi tiết kiệm trực tuyến (E-Savings)
![E-Savings Page](images/screenshot_savings.jpg)
> Giao diện mở sổ tiết kiệm với công cụ tính toán lãi suất nhận được trực quan theo từng kỳ hạn gửi.

### 🛡️ Trình Quản trị viên Admin hệ thống (Admin Dashboard)
![Admin Dashboard](images/screenshot_admin.jpg)
> Trang thống kê dành riêng cho quản trị viên, hỗ trợ các chức năng CRUD quản lý tài khoản khách hàng bảo mật.

---
*Dự án được phát triển và vận hành bởi đội ngũ **GT Smart Bank**. Mọi bản quyền được bảo lưu.*
*Sinh viên thực hiện: **HUỲNH NGÂN GIANG** & **PHAN THỊ MAI TRÂM**.*