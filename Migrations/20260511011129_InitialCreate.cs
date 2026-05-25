using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GTSmartBank.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChiNhanh",
                columns: table => new
                {
                    MaCN = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenCN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiNhanh", x => x.MaCN);
                });

            migrationBuilder.CreateTable(
                name: "KhachHang",
                columns: table => new
                {
                    MaKH = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HoTen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CCCD = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    SoDienThoai = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MatKhauHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TrangThai = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhachHang", x => x.MaKH);
                });

            migrationBuilder.CreateTable(
                name: "NhanVien",
                columns: table => new
                {
                    MaNV = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaCN = table.Column<int>(type: "int", nullable: false),
                    HoTen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ChucVu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TenDangNhap = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MatKhauHash = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhanVien", x => x.MaNV);
                    table.ForeignKey(
                        name: "FK_NhanVien_ChiNhanh_MaCN",
                        column: x => x.MaCN,
                        principalTable: "ChiNhanh",
                        principalColumn: "MaCN",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaiKhoan",
                columns: table => new
                {
                    SoTaiKhoan = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MaKH = table.Column<int>(type: "int", nullable: false),
                    MaCN = table.Column<int>(type: "int", nullable: false),
                    LoaiTaiKhoan = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SoDu = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayMoTK = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrangThai = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaiKhoan", x => x.SoTaiKhoan);
                    table.ForeignKey(
                        name: "FK_TaiKhoan_ChiNhanh_MaCN",
                        column: x => x.MaCN,
                        principalTable: "ChiNhanh",
                        principalColumn: "MaCN",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaiKhoan_KhachHang_MaKH",
                        column: x => x.MaKH,
                        principalTable: "KhachHang",
                        principalColumn: "MaKH",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GiaoDich",
                columns: table => new
                {
                    MaGD = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TK_Nguon = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TK_Dich = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ThoiGianGD = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LoaiGD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GiaoDich", x => x.MaGD);
                    table.ForeignKey(
                        name: "FK_GiaoDich_TaiKhoan_TK_Nguon",
                        column: x => x.TK_Nguon,
                        principalTable: "TaiKhoan",
                        principalColumn: "SoTaiKhoan");
                });

            migrationBuilder.CreateTable(
                name: "SoTietKiem",
                columns: table => new
                {
                    MaSo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SoTaiKhoan = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SoTienGoc = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    KyHan = table.Column<int>(type: "int", nullable: false),
                    LaiSuat = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayMo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayDaoHan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoTietKiem", x => x.MaSo);
                    table.ForeignKey(
                        name: "FK_SoTietKiem_TaiKhoan_SoTaiKhoan",
                        column: x => x.SoTaiKhoan,
                        principalTable: "TaiKhoan",
                        principalColumn: "SoTaiKhoan",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LichSuOTP",
                columns: table => new
                {
                    MaOTP = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaGD = table.Column<int>(type: "int", nullable: false),
                    MaCode = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    ThoiGianTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ThoiGianHetHan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TrangThaiXacNhan = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichSuOTP", x => x.MaOTP);
                    table.ForeignKey(
                        name: "FK_LichSuOTP_GiaoDich_MaGD",
                        column: x => x.MaGD,
                        principalTable: "GiaoDich",
                        principalColumn: "MaGD",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDich_TK_Nguon",
                table: "GiaoDich",
                column: "TK_Nguon");

            migrationBuilder.CreateIndex(
                name: "IX_LichSuOTP_MaGD",
                table: "LichSuOTP",
                column: "MaGD");

            migrationBuilder.CreateIndex(
                name: "IX_NhanVien_MaCN",
                table: "NhanVien",
                column: "MaCN");

            migrationBuilder.CreateIndex(
                name: "IX_SoTietKiem_SoTaiKhoan",
                table: "SoTietKiem",
                column: "SoTaiKhoan");

            migrationBuilder.CreateIndex(
                name: "IX_TaiKhoan_MaCN",
                table: "TaiKhoan",
                column: "MaCN");

            migrationBuilder.CreateIndex(
                name: "IX_TaiKhoan_MaKH",
                table: "TaiKhoan",
                column: "MaKH");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LichSuOTP");

            migrationBuilder.DropTable(
                name: "NhanVien");

            migrationBuilder.DropTable(
                name: "SoTietKiem");

            migrationBuilder.DropTable(
                name: "GiaoDich");

            migrationBuilder.DropTable(
                name: "TaiKhoan");

            migrationBuilder.DropTable(
                name: "ChiNhanh");

            migrationBuilder.DropTable(
                name: "KhachHang");
        }
    }
}
