using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GTSmartBank.Models
{
    [Table("SoTietKiem")]
    public class SoTietKiem
    {
        [Key]
        [StringLength(20)]
        public string MaSo { get; set; } = string.Empty;

        [ForeignKey("TaiKhoan")]
        public string SoTaiKhoan { get; set; } = string.Empty;

        public decimal SoTienGoc { get; set; }

        public int KyHan { get; set; }

        public decimal LaiSuat { get; set; }

        public DateTime NgayMo { get; set; }

        public DateTime? NgayDaoHan { get; set; }

        public string TrangThai { get; set; } = string.Empty;

        public TaiKhoan? TaiKhoan { get; set; }
    }
}