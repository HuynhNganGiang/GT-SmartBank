using Microsoft.EntityFrameworkCore;
using GTSmartBank.Models;

namespace GTSmartBank.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<ChiNhanh> ChiNhanh { get; set; }
public DbSet<KhachHang> KhachHang { get; set; }
public DbSet<NhanVien> NhanVien { get; set; }
public DbSet<TaiKhoan> TaiKhoan { get; set; }
public DbSet<RefreshToken> RefreshTokens { get; set; }
public DbSet<SoTietKiem> SoTietKiem { get; set; }
public DbSet<GiaoDich> GiaoDich { get; set; }
public DbSet<LichSuOTP> LichSuOTP { get; set; }
    }
}