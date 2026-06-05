# 🏦 GT SmartBank - Hệ thống ngân hàng số

GT SmartBank là hệ thống ngân hàng số mô phỏng, được xây dựng phục vụ đồ án môn học. Hệ thống gồm Backend ASP.NET Core Web API, cơ sở dữ liệu SQL Server, giao diện Web, xác thực JWT, Swagger API và triển khai thực tế trên VPS Windows Server/IIS.

---

## 🚀 Công nghệ sử dụng

* ⚙️ ASP.NET Core Web API
* 🗄️ SQL Server
* 🔗 Entity Framework Core
* 🔐 JWT Authentication
* ♻️ Refresh Token
* 📄 Swagger API
* 🌐 HTML / CSS / JavaScript
* 🖥️ IIS Deployment
* ☁️ VPS Windows Server
* 🌍 Domain: https://gtdigital.io.vn

---

## 🔑 Chức năng chính

* 🔐 Đăng nhập bằng JWT
* 👥 Phân quyền Admin/User
* 👤 Quản lý khách hàng
* 💳 Quản lý tài khoản ngân hàng
* 💸 Chuyển tiền có xác thực OTP
* 📜 Xem lịch sử giao dịch
* 💰 Quản lý sổ tiết kiệm
* 📊 Dashboard Admin
* 🔗 Kết nối API giữa Frontend và Backend
* 📱 Giao diện Web Responsive
* 🤖 Chatbot AI hỗ trợ người dùng

---

## 🗄️ Cơ sở dữ liệu

### Các bảng chính

| Bảng             | Mô tả                             |
| ---------------- | --------------------------------- |
| 🏢 ChiNhanh      | Lưu thông tin chi nhánh ngân hàng |
| 👤 KhachHang     | Lưu thông tin khách hàng          |
| 👨‍💼 NhanVien   | Lưu thông tin nhân viên           |
| 💳 TaiKhoan      | Lưu thông tin tài khoản ngân hàng |
| 💸 GiaoDich      | Lưu lịch sử giao dịch             |
| 🔐 LichSuOTP     | Lưu mã OTP xác thực               |
| 💰 SoTietKiem    | Lưu thông tin sổ tiết kiệm        |
| ♻️ RefreshTokens | Lưu Refresh Token đăng nhập       |

---

## 🌐 Demo hệ thống

### 🏠 Website

https://gtdigital.io.vn

### 📄 Swagger API

https://gtdigital.io.vn/swagger

---

## ⚙️ Hướng dẫn chạy Source Code

### 1️⃣ Clone source code từ GitHub

```bash
git clone https://github.com/HuynhNganGiang/GT-SmartBank.git
```

### 2️⃣ Mở project

Sử dụng:

* Visual Studio 2022
* Visual Studio Code

### 3️⃣ Cấu hình Database

Chỉnh sửa file:

```json
appsettings.json
```

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=GTSmartBank;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
}
```

### 4️⃣ Build Project

```bash
dotnet build
```

### 5️⃣ Chạy Project

```bash
dotnet run
```

### 6️⃣ Mở Swagger

```text
http://localhost:5232/swagger
```

### 7️⃣ Mở giao diện Web

```text
http://localhost:5232/bank-ui/index.html
```

---

## 🛡️ Thông tin SQL Server cho giảng viên

Do thông tin SQL Server có tài khoản và mật khẩu nên không công khai trực tiếp trên GitHub Public.

Thông tin kết nối SQL Server sẽ được gửi riêng cho giảng viên để kiểm tra dữ liệu thực tế.

### Mẫu thông tin gửi riêng

```text
Server name: IP_SERVER,1433
Authentication: SQL Server Authentication
Login: USER_SQL
Password: PASSWORD_SQL
Database: GTSmartBank
```

---

## 📂 Thành phần dự án

```text
GT-SmartBank
│
├── Controllers
├── Models
├── DTOs
├── Services
├── Data
├── Migrations
├── wwwroot
│   └── bank-ui
├── appsettings.json
├── Program.cs
└── README.md
```

---

## 👨‍🎓 Tác giả

### Sinh viên thực hiện

* 👨‍💻 Huỳnh Ngân Giang
* 👩‍💻 Phan Thị Mai Trâm

### Đề tài

🏦 **GT SmartBank - Hệ thống ngân hàng số**

---

⭐ Nếu dự án hữu ích, hãy Star Repository để ủng hộ nhóm phát triển.
