namespace GTSmartBank.DTOs
{
    public class ChuyenTienDTO
    {
        public string TK_Nguon { get; set; } = string.Empty;

        public string TK_Dich { get; set; } = string.Empty;

        public decimal SoTien { get; set; }

        public string? NoiDung { get; set; }

        public string? MaOTP { get; set; }
    }
}