using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GTSmartBank.Models
{
    [Table("LichSuOTP")]
    public class LichSuOTP
    {
        [Key]
        public int MaOTP { get; set; }

        [ForeignKey("GiaoDich")]
        public int? MaGD { get; set; }

        [Required]
        [StringLength(6)]
        public string MaCode { get; set; } = string.Empty;

        public DateTime ThoiGianTao { get; set; }

        public DateTime? ThoiGianHetHan { get; set; }

        public bool TrangThaiXacNhan { get; set; }

        [ForeignKey("TaiKhoan")]
        public string? SoTaiKhoan { get; set; }

        public TaiKhoan? TaiKhoan { get; set; }

        public GiaoDich? GiaoDich { get; set; }
    }
}