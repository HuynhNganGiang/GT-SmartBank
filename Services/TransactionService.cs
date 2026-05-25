using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GTSmartBank.Data;
using GTSmartBank.DTOs;
using GTSmartBank.Models;

namespace GTSmartBank.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly AppDbContext _context;
        private readonly IOtpService _otpService;

        public TransactionService(AppDbContext context, IOtpService otpService)
        {
            _context = context;
            _otpService = otpService;
        }

        public async Task<GiaoDich> TransferAsync(string tkNguon, string tkDich, decimal soTien, string? noiDung, string otpCode)
        {
            if (string.IsNullOrWhiteSpace(tkNguon)) throw new ArgumentException("Số tài khoản nguồn không được để trống.");
            if (string.IsNullOrWhiteSpace(tkDich)) throw new ArgumentException("Số tài khoản đích không được để trống.");
            if (soTien <= 0) throw new ArgumentException("Số tiền phải lớn hơn 0.");
            if (tkNguon == tkDich) throw new ArgumentException("Không thể chuyển tiền đến chính tài khoản đó.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var sourceAcc = await _context.TaiKhoan.FirstOrDefaultAsync(x => x.SoTaiKhoan == tkNguon);
                var destAcc = await _context.TaiKhoan.FirstOrDefaultAsync(x => x.SoTaiKhoan == tkDich);

                if (sourceAcc == null) throw new KeyNotFoundException("Tài khoản nguồn không tồn tại.");
                if (destAcc == null) throw new KeyNotFoundException("Tài khoản đích không tồn tại.");

                if (sourceAcc.SoDu < soTien)
                {
                    throw new InvalidOperationException("Số dư không đủ để thực hiện giao dịch.");
                }

                // Verify and claim the OTP for the source account
                var otpDb = await _otpService.VerifyOtpAsync(tkNguon, otpCode);

                // Deduct & credit
                sourceAcc.SoDu -= soTien;
                destAcc.SoDu += soTien;

                // Log transaction
                var gd = new GiaoDich
                {
                    TK_Nguon = tkNguon,
                    TK_Dich = tkDich,
                    SoTien = soTien,
                    ThoiGianGD = DateTime.Now,
                    LoaiGD = "Chuyển tiền",
                    NoiDung = noiDung ?? string.Empty,
                    TrangThai = "Thành công"
                };

                _context.GiaoDich.Add(gd);
                await _context.SaveChangesAsync();

                // Tie OTP record to the completed transaction
                otpDb.TrangThaiXacNhan = true;
                otpDb.MaGD = gd.MaGD;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return gd;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<TransactionDTO>> GetAllTransactionsAsync()
        {
            var txs = await _context.GiaoDich
                .OrderByDescending(x => x.ThoiGianGD)
                .ToListAsync();

            return txs.Select(MapToDTO);
        }

        public async Task<IEnumerable<TransactionDTO>> GetTransactionsByAccountAsync(string soTaiKhoan)
        {
            var txs = await _context.GiaoDich
                .Where(x => x.TK_Nguon == soTaiKhoan || x.TK_Dich == soTaiKhoan)
                .OrderByDescending(x => x.ThoiGianGD)
                .ToListAsync();

            return txs.Select(MapToDTO);
        }

        public async Task<IEnumerable<TransactionDTO>> GetTransactionsByCustomerAsync(int maKH)
        {
            // Get all accounts belonging to this customer
            var customerAccounts = await _context.TaiKhoan
                .Where(x => x.MaKH == maKH)
                .Select(x => x.SoTaiKhoan)
                .ToListAsync();

            var txs = await _context.GiaoDich
                .Where(x => customerAccounts.Contains(x.TK_Nguon) || customerAccounts.Contains(x.TK_Dich))
                .OrderByDescending(x => x.ThoiGianGD)
                .ToListAsync();

            return txs.Select(MapToDTO);
        }

        private static TransactionDTO MapToDTO(GiaoDich gd)
        {
            return new TransactionDTO
            {
                MaGD = gd.MaGD,
                TK_Nguon = gd.TK_Nguon,
                TK_Dich = gd.TK_Dich,
                SoTien = gd.SoTien,
                ThoiGianGD = gd.ThoiGianGD,
                LoaiGD = gd.LoaiGD,
                NoiDung = gd.NoiDung,
                TrangThai = gd.TrangThai
            };
        }
    }
}
