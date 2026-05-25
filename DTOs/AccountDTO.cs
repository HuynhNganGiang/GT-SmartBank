using System;

namespace GTSmartBank.DTOs
{
    public class AccountDTO
    {
        public string SoTaiKhoan { get; set; } = string.Empty;
        public int MaKH { get; set; }
        public string TenKhachHang { get; set; } = string.Empty;
        public int MaCN { get; set; }
        public string TenChiNhanh { get; set; } = string.Empty;
        public string LoaiTaiKhoan { get; set; } = string.Empty;
        public decimal SoDu { get; set; }
        public DateTime NgayMoTK { get; set; }
        public bool TrangThai { get; set; }
    }
}
