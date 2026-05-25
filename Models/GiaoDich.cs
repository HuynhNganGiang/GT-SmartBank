using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GTSmartBank.Models
{
    [Table("GiaoDich")]
    public class GiaoDich
    {
        [Key]
        public int MaGD { get; set; }

        // 🔐 Tài khoản nguồn (có thể null nếu system/fee)
        public string TK_Nguon { get; set; } = string.Empty;

        // 🔐 Tài khoản đích
        public string TK_Dich { get; set; } = string.Empty;

        // 💰 Số tiền giao dịch
        public decimal SoTien { get; set; }

        // 🕒 Thời gian giao dịch (SQL: ThoiGianGD DEFAULT GETDATE())
        public DateTime ThoiGianGD { get; set; } = DateTime.Now;

        // 📌 Loại giao dịch: chuyển tiền, nạp tiền...
        public string LoaiGD { get; set; } = "ChuyenTien";

        // 📝 Nội dung giao dịch
        public string NoiDung { get; set; } = string.Empty;

        // 📊 Trạng thái giao dịch
        public string TrangThai { get; set; } = "ThanhCong";
    }
}