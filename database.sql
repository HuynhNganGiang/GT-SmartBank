USE [master]
GO
/****** Object:  Database [GTSmartBank]    Script Date: 12/05/2026 9:56:54 CH ******/
CREATE DATABASE [GTSmartBank]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'GTSmartBank', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL12.SQLEXPRESS\MSSQL\DATA\GTSmartBank.mdf' , SIZE = 3264KB , MAXSIZE = UNLIMITED, FILEGROWTH = 1024KB )
 LOG ON 
( NAME = N'GTSmartBank_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL12.SQLEXPRESS\MSSQL\DATA\GTSmartBank_log.ldf' , SIZE = 832KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
GO
ALTER DATABASE [GTSmartBank] SET COMPATIBILITY_LEVEL = 120
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [GTSmartBank].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [GTSmartBank] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [GTSmartBank] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [GTSmartBank] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [GTSmartBank] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [GTSmartBank] SET ARITHABORT OFF 
GO
ALTER DATABASE [GTSmartBank] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [GTSmartBank] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [GTSmartBank] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [GTSmartBank] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [GTSmartBank] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [GTSmartBank] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [GTSmartBank] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [GTSmartBank] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [GTSmartBank] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [GTSmartBank] SET  ENABLE_BROKER 
GO
ALTER DATABASE [GTSmartBank] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [GTSmartBank] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [GTSmartBank] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [GTSmartBank] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [GTSmartBank] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [GTSmartBank] SET READ_COMMITTED_SNAPSHOT ON 
GO
ALTER DATABASE [GTSmartBank] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [GTSmartBank] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [GTSmartBank] SET  MULTI_USER 
GO
ALTER DATABASE [GTSmartBank] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [GTSmartBank] SET DB_CHAINING OFF 
GO
ALTER DATABASE [GTSmartBank] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [GTSmartBank] SET TARGET_RECOVERY_TIME = 0 SECONDS 
GO
ALTER DATABASE [GTSmartBank] SET DELAYED_DURABILITY = DISABLED 
GO
USE [GTSmartBank]
GO
/****** Object:  Table [dbo].[__EFMigrationsHistory]    Script Date: 12/05/2026 9:56:55 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[__EFMigrationsHistory](
	[MigrationId] [nvarchar](150) NOT NULL,
	[ProductVersion] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED 
(
	[MigrationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[ChiNhanh]    Script Date: 12/05/2026 9:56:55 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiNhanh](
	[MaCN] [int] IDENTITY(1,1) NOT NULL,
	[TenCN] [nvarchar](max) NOT NULL,
	[DiaChi] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_ChiNhanh] PRIMARY KEY CLUSTERED 
(
	[MaCN] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[GiaoDich]    Script Date: 12/05/2026 9:56:55 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GiaoDich](
	[MaGD] [int] IDENTITY(1,1) NOT NULL,
	[TK_Nguon] [nvarchar](450) NULL,
	[TK_Dich] [nvarchar](max) NOT NULL,
	[SoTien] [decimal](18, 2) NOT NULL,
	[ThoiGianGD] [datetime2](7) NOT NULL,
	[LoaiGD] [nvarchar](max) NULL,
	[NoiDung] [nvarchar](max) NULL,
	[TrangThai] [nvarchar](max) NULL,
 CONSTRAINT [PK_GiaoDich] PRIMARY KEY CLUSTERED 
(
	[MaGD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[KhachHang]    Script Date: 12/05/2026 9:56:55 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KhachHang](
	[MaKH] [int] IDENTITY(1,1) NOT NULL,
	[HoTen] [nvarchar](100) NOT NULL,
	[CCCD] [nvarchar](12) NOT NULL,
	[SoDienThoai] [nvarchar](15) NOT NULL,
	[Email] [nvarchar](max) NULL,
	[DiaChi] [nvarchar](max) NULL,
	[MatKhauHash] [nvarchar](max) NOT NULL,
	[TrangThai] [bit] NOT NULL CONSTRAINT [DF_KhachHang_TrangThai]  DEFAULT ((1)),
	[Role] [nvarchar](50) NULL,
 CONSTRAINT [PK_KhachHang] PRIMARY KEY CLUSTERED 
(
	[MaKH] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[LichSuOTP]    Script Date: 12/05/2026 9:56:55 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LichSuOTP](
	[MaOTP] [int] IDENTITY(1,1) NOT NULL,
	[MaGD] [int] NULL,
	[MaCode] [nvarchar](6) NOT NULL,
	[ThoiGianTao] [datetime2](7) NOT NULL,
	[ThoiGianHetHan] [datetime2](7) NULL,
	[TrangThaiXacNhan] [bit] NOT NULL,
 CONSTRAINT [PK_LichSuOTP] PRIMARY KEY CLUSTERED 
(
	[MaOTP] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[NhanVien]    Script Date: 12/05/2026 9:56:55 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NhanVien](
	[MaNV] [int] IDENTITY(1,1) NOT NULL,
	[MaCN] [int] NOT NULL,
	[HoTen] [nvarchar](100) NOT NULL,
	[ChucVu] [nvarchar](50) NOT NULL,
	[TenDangNhap] [nvarchar](50) NOT NULL,
	[MatKhauHash] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_NhanVien] PRIMARY KEY CLUSTERED 
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[RefreshTokens]    Script Date: 12/05/2026 9:56:55 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RefreshTokens](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[Token] [nvarchar](500) NOT NULL,
	[ExpiryDate] [datetime] NOT NULL,
	[IsRevoked] [bit] NOT NULL DEFAULT ((0)),
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[SoTietKiem]    Script Date: 12/05/2026 9:56:55 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SoTietKiem](
	[MaSo] [nvarchar](20) NOT NULL,
	[SoTaiKhoan] [nvarchar](450) NOT NULL,
	[SoTienGoc] [decimal](18, 2) NOT NULL,
	[KyHan] [int] NOT NULL,
	[LaiSuat] [decimal](18, 2) NOT NULL,
	[NgayMo] [datetime2](7) NOT NULL,
	[NgayDaoHan] [datetime2](7) NULL,
	[TrangThai] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_SoTietKiem] PRIMARY KEY CLUSTERED 
(
	[MaSo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TaiKhoan]    Script Date: 12/05/2026 9:56:55 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaiKhoan](
	[SoTaiKhoan] [nvarchar](450) NOT NULL,
	[MaKH] [int] NOT NULL,
	[MaCN] [int] NOT NULL,
	[LoaiTaiKhoan] [nvarchar](max) NOT NULL,
	[SoDu] [decimal](18, 2) NOT NULL,
	[NgayMoTK] [datetime2](7) NOT NULL,
	[TrangThai] [bit] NOT NULL,
 CONSTRAINT [PK_TaiKhoan] PRIMARY KEY CLUSTERED 
(
	[SoTaiKhoan] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260511011129_InitialCreate', N'8.0.8')
SET IDENTITY_INSERT [dbo].[ChiNhanh] ON 

INSERT [dbo].[ChiNhanh] ([MaCN], [TenCN], [DiaChi]) VALUES (1, N'Tân Bình', N'TP.HCM')
INSERT [dbo].[ChiNhanh] ([MaCN], [TenCN], [DiaChi]) VALUES (2, N'Hà Nội', N'Hà Nội')
INSERT [dbo].[ChiNhanh] ([MaCN], [TenCN], [DiaChi]) VALUES (3, N'Đà Nẵng', N'Đà Nẵng')
SET IDENTITY_INSERT [dbo].[ChiNhanh] OFF
SET IDENTITY_INSERT [dbo].[GiaoDich] ON 

INSERT [dbo].[GiaoDich] ([MaGD], [TK_Nguon], [TK_Dich], [SoTien], [ThoiGianGD], [LoaiGD], [NoiDung], [TrangThai]) VALUES (2, N'2002002001', N'2002002002', CAST(100000.00 AS Decimal(18, 2)), CAST(N'2026-05-12 12:59:42.2900000' AS DateTime2), N'Chuyển tiền', N'Test chuyển tiền', N'Thành công')
INSERT [dbo].[GiaoDich] ([MaGD], [TK_Nguon], [TK_Dich], [SoTien], [ThoiGianGD], [LoaiGD], [NoiDung], [TrangThai]) VALUES (3, N'2002002003', N'2002002001', CAST(500000.00 AS Decimal(18, 2)), CAST(N'2026-05-12 12:59:42.2900000' AS DateTime2), N'Chuyển tiền', N'Admin test', N'Thành công')
INSERT [dbo].[GiaoDich] ([MaGD], [TK_Nguon], [TK_Dich], [SoTien], [ThoiGianGD], [LoaiGD], [NoiDung], [TrangThai]) VALUES (4, N'2002002001', N'2002002002', CAST(100000.00 AS Decimal(18, 2)), CAST(N'2026-05-12 13:14:40.6418425' AS DateTime2), N'Chuyển tiền', N'Test chuyen tien sau khi them du lieu', N'Thành công')
INSERT [dbo].[GiaoDich] ([MaGD], [TK_Nguon], [TK_Dich], [SoTien], [ThoiGianGD], [LoaiGD], [NoiDung], [TrangThai]) VALUES (5, N'2002002001', N'2002002002', CAST(100000.00 AS Decimal(18, 2)), CAST(N'2026-05-12 14:15:51.1282587' AS DateTime2), N'Chuyển tiền', N'Chuyen tien OTP', N'Thành công')
SET IDENTITY_INSERT [dbo].[GiaoDich] OFF
SET IDENTITY_INSERT [dbo].[KhachHang] ON 

INSERT [dbo].[KhachHang] ([MaKH], [HoTen], [CCCD], [SoDienThoai], [Email], [DiaChi], [MatKhauHash], [TrangThai], [Role]) VALUES (1, N'Phạm Văn D', N'123456789777', N'0977777777', N'phamvand@gmail.com', N'Đà Nẵng', N'123456', 1, N'Admin')
INSERT [dbo].[KhachHang] ([MaKH], [HoTen], [CCCD], [SoDienThoai], [Email], [DiaChi], [MatKhauHash], [TrangThai], [Role]) VALUES (2, N'Hoàng Thị E', N'123456789666', N'0966666666', N'hoangthie@gmail.com', N'Cần Thơ', N'123456', 1, N'User')
INSERT [dbo].[KhachHang] ([MaKH], [HoTen], [CCCD], [SoDienThoai], [Email], [DiaChi], [MatKhauHash], [TrangThai], [Role]) VALUES (3, N'Admin', N'111111111111', N'0909999999', N'admin@gmail.com', N'TP.HCM', N'123456', 1, N'Admin')
SET IDENTITY_INSERT [dbo].[KhachHang] OFF
SET IDENTITY_INSERT [dbo].[LichSuOTP] ON 

INSERT [dbo].[LichSuOTP] ([MaOTP], [MaGD], [MaCode], [ThoiGianTao], [ThoiGianHetHan], [TrangThaiXacNhan]) VALUES (2, NULL, N'123456', CAST(N'2026-05-12 14:10:31.1470000' AS DateTime2), CAST(N'2026-05-12 14:13:31.1470000' AS DateTime2), 0)
INSERT [dbo].[LichSuOTP] ([MaOTP], [MaGD], [MaCode], [ThoiGianTao], [ThoiGianHetHan], [TrangThaiXacNhan]) VALUES (3, NULL, N'654321', CAST(N'2026-05-12 14:10:31.1470000' AS DateTime2), CAST(N'2026-05-12 14:13:31.1470000' AS DateTime2), 0)
INSERT [dbo].[LichSuOTP] ([MaOTP], [MaGD], [MaCode], [ThoiGianTao], [ThoiGianHetHan], [TrangThaiXacNhan]) VALUES (4, 5, N'468725', CAST(N'2026-05-12 14:14:22.6497603' AS DateTime2), CAST(N'2026-05-12 14:17:22.6498022' AS DateTime2), 1)
SET IDENTITY_INSERT [dbo].[LichSuOTP] OFF
SET IDENTITY_INSERT [dbo].[NhanVien] ON 

INSERT [dbo].[NhanVien] ([MaNV], [MaCN], [HoTen], [ChucVu], [TenDangNhap], [MatKhauHash]) VALUES (1, 1, N'Nguyễn Văn Quản Lý', N'Quản lý', N'adminnv', N'123456')
INSERT [dbo].[NhanVien] ([MaNV], [MaCN], [HoTen], [ChucVu], [TenDangNhap], [MatKhauHash]) VALUES (2, 1, N'Trần Thị Giao Dịch', N'Giao dịch viên', N'giaodich1', N'123456')
INSERT [dbo].[NhanVien] ([MaNV], [MaCN], [HoTen], [ChucVu], [TenDangNhap], [MatKhauHash]) VALUES (3, 2, N'Lê Văn Kiểm Soát', N'Kiểm soát viên', N'kiemsoat1', N'123456')
SET IDENTITY_INSERT [dbo].[NhanVien] OFF
SET IDENTITY_INSERT [dbo].[RefreshTokens] ON 

INSERT [dbo].[RefreshTokens] ([Id], [UserId], [Token], [ExpiryDate], [IsRevoked]) VALUES (1, 3, N'f0a235c3-a259-4492-9bf2-1ec5320022ff', CAST(N'2026-05-19 12:15:26.017' AS DateTime), 1)
INSERT [dbo].[RefreshTokens] ([Id], [UserId], [Token], [ExpiryDate], [IsRevoked]) VALUES (2, 3, N'be080630-a69d-4d61-a595-c1ca8d30b824', CAST(N'2026-05-19 12:17:43.673' AS DateTime), 0)
INSERT [dbo].[RefreshTokens] ([Id], [UserId], [Token], [ExpiryDate], [IsRevoked]) VALUES (3, 1, N'a7d26bb5-63aa-4f65-ac8f-c8878c98f65b', CAST(N'2026-05-19 12:28:38.540' AS DateTime), 0)
INSERT [dbo].[RefreshTokens] ([Id], [UserId], [Token], [ExpiryDate], [IsRevoked]) VALUES (4, 3, N'd3da9aea-efe7-4fb4-9080-510742cb1248', CAST(N'2026-05-19 12:38:03.100' AS DateTime), 0)
INSERT [dbo].[RefreshTokens] ([Id], [UserId], [Token], [ExpiryDate], [IsRevoked]) VALUES (5, 3, N'4a326ee2-117b-41ce-bf76-251627722a7f', CAST(N'2026-05-19 13:13:53.997' AS DateTime), 0)
INSERT [dbo].[RefreshTokens] ([Id], [UserId], [Token], [ExpiryDate], [IsRevoked]) VALUES (6, 3, N'76fbb061-15c2-444f-a0a6-9e76815a2be5', CAST(N'2026-05-19 13:44:28.590' AS DateTime), 0)
INSERT [dbo].[RefreshTokens] ([Id], [UserId], [Token], [ExpiryDate], [IsRevoked]) VALUES (7, 3, N'f3de3f88-fbb9-4f4c-895e-42275d66ec54', CAST(N'2026-05-19 14:13:53.813' AS DateTime), 0)
SET IDENTITY_INSERT [dbo].[RefreshTokens] OFF
INSERT [dbo].[SoTietKiem] ([MaSo], [SoTaiKhoan], [SoTienGoc], [KyHan], [LaiSuat], [NgayMo], [NgayDaoHan], [TrangThai]) VALUES (N'STK001', N'2002002001', CAST(10000000.00 AS Decimal(18, 2)), 6, CAST(6.50 AS Decimal(18, 2)), CAST(N'2026-05-12 12:59:42.3000000' AS DateTime2), CAST(N'2026-11-12 12:59:42.3000000' AS DateTime2), N'Đang gửi')
INSERT [dbo].[SoTietKiem] ([MaSo], [SoTaiKhoan], [SoTienGoc], [KyHan], [LaiSuat], [NgayMo], [NgayDaoHan], [TrangThai]) VALUES (N'STK002', N'2002002002', CAST(5000000.00 AS Decimal(18, 2)), 3, CAST(6.00 AS Decimal(18, 2)), CAST(N'2026-05-12 12:59:42.3000000' AS DateTime2), CAST(N'2026-08-12 12:59:42.3000000' AS DateTime2), N'Đang gửi')
INSERT [dbo].[TaiKhoan] ([SoTaiKhoan], [MaKH], [MaCN], [LoaiTaiKhoan], [SoDu], [NgayMoTK], [TrangThai]) VALUES (N'2002002001', 1, 1, N'Thanh toán', CAST(4800000.00 AS Decimal(18, 2)), CAST(N'2026-05-12 12:59:42.2600000' AS DateTime2), 1)
INSERT [dbo].[TaiKhoan] ([SoTaiKhoan], [MaKH], [MaCN], [LoaiTaiKhoan], [SoDu], [NgayMoTK], [TrangThai]) VALUES (N'2002002002', 2, 1, N'Thanh toán', CAST(2200000.00 AS Decimal(18, 2)), CAST(N'2026-05-12 12:59:42.2600000' AS DateTime2), 1)
INSERT [dbo].[TaiKhoan] ([SoTaiKhoan], [MaKH], [MaCN], [LoaiTaiKhoan], [SoDu], [NgayMoTK], [TrangThai]) VALUES (N'2002002003', 3, 2, N'Thanh toán', CAST(10000000.00 AS Decimal(18, 2)), CAST(N'2026-05-12 12:59:42.2600000' AS DateTime2), 1)
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_GiaoDich_TK_Nguon]    Script Date: 12/05/2026 9:56:55 CH ******/
CREATE NONCLUSTERED INDEX [IX_GiaoDich_TK_Nguon] ON [dbo].[GiaoDich]
(
	[TK_Nguon] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_LichSuOTP_MaGD]    Script Date: 12/05/2026 9:56:55 CH ******/
CREATE NONCLUSTERED INDEX [IX_LichSuOTP_MaGD] ON [dbo].[LichSuOTP]
(
	[MaGD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_NhanVien_MaCN]    Script Date: 12/05/2026 9:56:55 CH ******/
CREATE NONCLUSTERED INDEX [IX_NhanVien_MaCN] ON [dbo].[NhanVien]
(
	[MaCN] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_SoTietKiem_SoTaiKhoan]    Script Date: 12/05/2026 9:56:55 CH ******/
CREATE NONCLUSTERED INDEX [IX_SoTietKiem_SoTaiKhoan] ON [dbo].[SoTietKiem]
(
	[SoTaiKhoan] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_TaiKhoan_MaCN]    Script Date: 12/05/2026 9:56:55 CH ******/
CREATE NONCLUSTERED INDEX [IX_TaiKhoan_MaCN] ON [dbo].[TaiKhoan]
(
	[MaCN] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_TaiKhoan_MaKH]    Script Date: 12/05/2026 9:56:55 CH ******/
CREATE NONCLUSTERED INDEX [IX_TaiKhoan_MaKH] ON [dbo].[TaiKhoan]
(
	[MaKH] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [dbo].[GiaoDich]  WITH CHECK ADD  CONSTRAINT [FK_GiaoDich_TaiKhoan_TK_Nguon] FOREIGN KEY([TK_Nguon])
REFERENCES [dbo].[TaiKhoan] ([SoTaiKhoan])
GO
ALTER TABLE [dbo].[GiaoDich] CHECK CONSTRAINT [FK_GiaoDich_TaiKhoan_TK_Nguon]
GO
ALTER TABLE [dbo].[LichSuOTP]  WITH CHECK ADD  CONSTRAINT [FK_LichSuOTP_GiaoDich_MaGD] FOREIGN KEY([MaGD])
REFERENCES [dbo].[GiaoDich] ([MaGD])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[LichSuOTP] CHECK CONSTRAINT [FK_LichSuOTP_GiaoDich_MaGD]
GO
ALTER TABLE [dbo].[NhanVien]  WITH CHECK ADD  CONSTRAINT [FK_NhanVien_ChiNhanh_MaCN] FOREIGN KEY([MaCN])
REFERENCES [dbo].[ChiNhanh] ([MaCN])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[NhanVien] CHECK CONSTRAINT [FK_NhanVien_ChiNhanh_MaCN]
GO
ALTER TABLE [dbo].[SoTietKiem]  WITH CHECK ADD  CONSTRAINT [FK_SoTietKiem_TaiKhoan_SoTaiKhoan] FOREIGN KEY([SoTaiKhoan])
REFERENCES [dbo].[TaiKhoan] ([SoTaiKhoan])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[SoTietKiem] CHECK CONSTRAINT [FK_SoTietKiem_TaiKhoan_SoTaiKhoan]
GO
ALTER TABLE [dbo].[TaiKhoan]  WITH CHECK ADD  CONSTRAINT [FK_TaiKhoan_ChiNhanh_MaCN] FOREIGN KEY([MaCN])
REFERENCES [dbo].[ChiNhanh] ([MaCN])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TaiKhoan] CHECK CONSTRAINT [FK_TaiKhoan_ChiNhanh_MaCN]
GO
ALTER TABLE [dbo].[TaiKhoan]  WITH CHECK ADD  CONSTRAINT [FK_TaiKhoan_KhachHang_MaKH] FOREIGN KEY([MaKH])
REFERENCES [dbo].[KhachHang] ([MaKH])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TaiKhoan] CHECK CONSTRAINT [FK_TaiKhoan_KhachHang_MaKH]
GO
USE [master]
GO
ALTER DATABASE [GTSmartBank] SET  READ_WRITE 
GO
USE GTSmartBank;
GO

/* =========================================================
   PHÂN QUYỀN CHUẨN GT SMARTBANK
   1. Founder/Admin chính: Huỳnh Ngân Giang - Admin
   2. Nhân viên ngân hàng - Staff
   3. Khách hàng - User
========================================================= */

-- 1. Đưa toàn bộ tài khoản Admin cũ về User
UPDATE KhachHang
SET Role = N'User'
WHERE Role = N'Admin';

-- 2. Chỉ định Huỳnh Ngân Giang là Founder/Admin chính
UPDATE KhachHang
SET 
    HoTen = N'Huỳnh Ngân Giang',
    Email = N'sonhuynh2014.bt@gmail.com',
    DiaChi = N'Việt Nam',
    Role = N'Admin',
    TrangThai = 1
WHERE SoDienThoai = N'0909999999';

-- 3. Xóa dữ liệu nhân viên demo cũ
DELETE FROM NhanVien;
DBCC CHECKIDENT ('NhanVien', RESEED, 0);

-- 4. Thêm 4 nhân viên ngân hàng
INSERT INTO NhanVien
(
    MaCN,
    HoTen,
    ChucVu,
    TenDangNhap,
    MatKhauHash
)
VALUES
(1, N'Nguyễn Thị Anh Vũ', N'Data & Database Manager', N'anhvu', N'123456'),
(1, N'Trần Lê Anh Thư', N'UI/UX & Product Designer', N'anhthu', N'123456'),
(1, N'Phan Thị Mai Trâm', N'Security & Quality Assurance', N'maitram', N'123456'),
(1, N'Nguyễn Thị Phương Nhưng', N'CTO - System Developer', N'phuongnhung', N'123456');

-- 5. Kiểm tra lại khách hàng và phân quyền
SELECT 
    MaKH,
    HoTen,
    SoDienThoai,
    Email,
    Role,
    TrangThai
FROM KhachHang
ORDER BY 
    CASE 
        WHEN Role = N'Admin' THEN 1
        WHEN Role = N'Staff' THEN 2
        ELSE 3
    END,
    MaKH;

-- 6. Kiểm tra danh sách nhân viên ngân hàng
SELECT 
    MaNV,
    MaCN,
    HoTen,
    ChucVu,
    TenDangNhap
FROM NhanVien
ORDER BY MaNV;
USE GTSmartBank;
GO

USE GTSmartBank;
GO

-- 1. Kiểm tra hiện có tài khoản nào
SELECT MaKH, HoTen, SoDienThoai, MatKhauHash, Role, TrangThai
FROM KhachHang;

-- 2. Đưa tất cả Admin cũ về User
UPDATE KhachHang
SET Role = N'User'
WHERE Role = N'Admin';

-- 3. Set tài khoản MaKH = 3 làm Admin chính
UPDATE KhachHang
SET 
    HoTen = N'Huỳnh Ngân Giang',
    Email = N'sonhuynh2014.bt@gmail.com',
    DiaChi = N'Việt Nam',
    SoDienThoai = N'0366604140',
    MatKhauHash = N'1234567',
    Role = N'Admin',
    TrangThai = 1
WHERE MaKH = 3;

-- 4. Xóa token cũ để tránh phiên đăng nhập hết hạn
DELETE FROM RefreshTokens
WHERE UserId = 3;

-- 5. Kiểm tra lại
SELECT MaKH, HoTen, SoDienThoai, MatKhauHash, Role, TrangThai
FROM KhachHang
WHERE MaKH = 3;