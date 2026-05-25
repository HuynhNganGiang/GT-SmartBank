namespace GTSmartBank.DTOs
{
    public class CustomerDTO
    {
        public int MaKH { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string CCCD { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
        public string? Role { get; set; }
        public bool TrangThai { get; set; }
    }
}
