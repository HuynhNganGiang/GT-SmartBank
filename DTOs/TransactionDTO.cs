using System;

namespace GTSmartBank.DTOs
{
    public class TransactionDTO
    {
        public int MaGD { get; set; }
        public string TK_Nguon { get; set; } = string.Empty;
        public string TK_Dich { get; set; } = string.Empty;
        public decimal SoTien { get; set; }
        public DateTime ThoiGianGD { get; set; }
        public string LoaiGD { get; set; } = "ChuyenTien";
        public string NoiDung { get; set; } = string.Empty;
        public string TrangThai { get; set; } = "ThanhCong";
    }
}
