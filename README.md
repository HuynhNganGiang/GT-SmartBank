GT SmartBank - Hệ thống ngân hàng số
GT SmartBank là hệ thống ngân hàng số mô phỏng, được xây dựng phục vụ đồ án môn học. Hệ thống gồm Backend ASP.NET Core Web API, cơ sở dữ liệu SQL Server, giao diện Web, xác thực JWT, Swagger API và triển khai thực tế trên VPS Windows Server/IIS.
Công nghệ sử dụng
ASP.NET Core Web API
SQL Server
Entity Framework Core
JWT Authentication
Refresh Token
Swagger API
HTML/CSS/JavaScript
IIS Deployment
VPS Windows Server
Domain: https://gtdigital.io.vn
Chức năng chính
Đăng nhập bằng JWT
Phân quyền Admin/User
Quản lý khách hàng
Quản lý tài khoản ngân hàng
Chuyển tiền có xác thực OTP
Xem lịch sử giao dịch
Quản lý sổ tiết kiệm
Dashboard Admin
Kết nối API giữa Frontend và Backend
Giao diện Web responsive
Chatbot AI hỗ trợ người dùng
Cơ sở dữ liệu
Các bảng chính:
ChiNhanh: Lưu thông tin chi nhánh ngân hàng.
KhachHang: Lưu thông tin khách hàng.
NhanVien: Lưu thông tin nhân viên.
TaiKhoan: Lưu thông tin tài khoản ngân hàng.
GiaoDich: Lưu lịch sử giao dịch.
LichSuOTP: Lưu mã OTP xác thực.
SoTietKiem: Lưu thông tin sổ tiết kiệm.
RefreshTokens: Lưu Refresh Token đăng nhập.
Demo hệ thống
Website:
https://gtdigital.io.vn
Swagger API:
https://gtdigital.io.vn/swagger
Hướng dẫn chạy source code
1.Clone source code từ GitHub:
git clone https://github.com/HuynhNganGiang/GT-SmartBank.git
2.Mở project bằng Visual Studio hoặc VS Code.
3.Cấu hình chuỗi kết nối trong file appsettings.json:
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=GTSmartBank;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
}
4.Build project:
dotnet build
5.Chạy project:
dotnet run
6.Mở Swagger để kiểm tra API:
http://localhost:5232/swagger
7.Mở giao diện Web:
http://localhost:5232/bank-ui/index.html
Thông tin SQL Server cho giảng viên.
Server name: 14.225.224.67,1433
Authentication: SQL Server Authentication
Login: nhom_gtsmartbank
Password: GtmartBank@20226
Database: GTSmartBank
Tác giả
Sinh viên thực hiện:
Huỳnh Ngân Giang
Phan Thị Mai Trâm
Đề tài: GT SmartBank - Hệ thống ngân hàng số