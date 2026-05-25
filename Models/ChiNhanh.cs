using System.ComponentModel.DataAnnotations;
namespace GTSmartBank.Models
{
    public class ChiNhanh
    {
       [Key]
        public int MaCN { get; set; }

        public string TenCN { get; set; } = string.Empty;

        public string DiaChi { get; set; } = string.Empty;
    }
}