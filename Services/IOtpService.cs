using System.Threading.Tasks;
using GTSmartBank.Models;

namespace GTSmartBank.Services
{
    public interface IOtpService
    {
        Task<string> GenerateOtpAsync(string soTaiKhoan);
        Task<LichSuOTP> VerifyOtpAsync(string soTaiKhoan, string code);
    }
}
