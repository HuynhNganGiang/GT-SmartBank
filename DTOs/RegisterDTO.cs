namespace GTSmartBank.DTOs
{
    public class RegisterDTO
    {
        public string HoTen { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
    }
}