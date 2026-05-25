using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GTSmartBank.Data;
using GTSmartBank.Models;

namespace GTSmartBank.Services
{
    public class OtpService : IOtpService
    {
        private readonly AppDbContext _context;

        public OtpService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateOtpAsync(string soTaiKhoan)
        {
            // Generate a 6-digit random code
            var code = Random.Shared.Next(100000, 999999).ToString();

            var otp = new LichSuOTP
            {
                MaGD = null,
                MaCode = code,
                ThoiGianTao = DateTime.Now,
                ThoiGianHetHan = DateTime.Now.AddMinutes(3),
                TrangThaiXacNhan = false,
                SoTaiKhoan = soTaiKhoan
            };

            _context.LichSuOTP.Add(otp);
            await _context.SaveChangesAsync();

            return code;
        }

        public async Task<LichSuOTP> VerifyOtpAsync(string soTaiKhoan, string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Mã OTP không được để trống.");

            var otpDb = await _context.LichSuOTP
                .Where(x =>
                    x.MaCode == code &&
                    x.SoTaiKhoan == soTaiKhoan &&
                    x.TrangThaiXacNhan == false &&
                    x.ThoiGianHetHan != null &&
                    x.ThoiGianHetHan > DateTime.Now)
                .OrderByDescending(x => x.ThoiGianTao)
                .FirstOrDefaultAsync();

            if (otpDb == null)
            {
                throw new InvalidOperationException("Mã OTP không hợp lệ, đã được sử dụng hoặc đã hết hạn.");
            }

            return otpDb;
        }
    }
}
