using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GTSmartBank.Models
{
    [Table("TaiKhoan")]
    public class TaiKhoan
    {
        [Key]
        public string SoTaiKhoan { get; set; } = string.Empty;

        [ForeignKey("KhachHang")]
        public int MaKH { get; set; }

        [ForeignKey("ChiNhanh")]
        public int MaCN { get; set; }

        public string LoaiTaiKhoan { get; set; } = string.Empty;

        public decimal SoDu { get; set; }

        public DateTime NgayMoTK { get; set; }

        public bool TrangThai { get; set; }

        public KhachHang? KhachHang { get; set; }

        public ChiNhanh? ChiNhanh { get; set; }
    }
}