using System;

namespace GTSmartBank.DTOs
{
    public class SavingsAccountDTO
    {
        public string MaSo { get; set; } = string.Empty;
        public string SoTaiKhoan { get; set; } = string.Empty;

        public int? MaKH { get; set; }
        public string? HoTen { get; set; }
        public string? CCCD { get; set; }

        public decimal SoTienGoc { get; set; }
        public int KyHan { get; set; }
        public decimal LaiSuat { get; set; }
        public DateTime NgayMo { get; set; }
        public DateTime? NgayDaoHan { get; set; }
        public string TrangThai { get; set; } = string.Empty;
    }
}