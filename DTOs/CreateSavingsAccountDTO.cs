namespace GTSmartBank.DTOs
{
    public class CreateSavingsAccountDTO
    {
        public string SoTaiKhoan { get; set; } = string.Empty;
        public decimal SoTienGoc { get; set; }
        public int KyHan { get; set; }
    }
}
