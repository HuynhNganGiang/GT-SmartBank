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
    public class AccountService : IAccountService
    {
        private readonly AppDbContext _context;

        public AccountService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AccountDTO>> GetAllAccountsAsync()
        {
            var accounts = await _context.TaiKhoan
                .Include(x => x.KhachHang)
                .Include(x => x.ChiNhanh)
                .ToListAsync();

            return accounts.Select(MapToDTO);
        }

        public async Task<AccountDTO?> GetAccountDetailsAsync(string soTaiKhoan)
        {
            var account = await _context.TaiKhoan
                .Include(x => x.KhachHang)
                .Include(x => x.ChiNhanh)
                .FirstOrDefaultAsync(x => x.SoTaiKhoan == soTaiKhoan);

            return account == null ? null : MapToDTO(account);
        }

        public async Task<TaiKhoan?> GetAccountByNumberAsync(string soTaiKhoan)
        {
            return await _context.TaiKhoan.FirstOrDefaultAsync(x => x.SoTaiKhoan == soTaiKhoan);
        }

        public async Task<AccountDTO> CreateAccountAsync(TaiKhoan account)
        {
            // Validate client-supplied info
            if (account == null) throw new ArgumentNullException(nameof(account));
            if (string.IsNullOrWhiteSpace(account.SoTaiKhoan)) throw new ArgumentException("Số tài khoản không được để trống.");

            var exists = await _context.TaiKhoan.AnyAsync(x => x.SoTaiKhoan == account.SoTaiKhoan);
            if (exists) throw new InvalidOperationException($"Số tài khoản {account.SoTaiKhoan} đã tồn tại.");

            account.NgayMoTK = DateTime.Now;
            _context.TaiKhoan.Add(account);
            await _context.SaveChangesAsync();

            // Reload to map correctly
            var saved = await _context.TaiKhoan
                .Include(x => x.KhachHang)
                .Include(x => x.ChiNhanh)
                .FirstAsync(x => x.SoTaiKhoan == account.SoTaiKhoan);

            return MapToDTO(saved);
        }

        public async Task UpdateAccountAsync(string soTaiKhoan, TaiKhoan account)
        {
            if (account == null) throw new ArgumentNullException(nameof(account));
            if (soTaiKhoan != account.SoTaiKhoan) throw new ArgumentException("Số tài khoản không khớp.");

            var exists = await _context.TaiKhoan.AnyAsync(x => x.SoTaiKhoan == soTaiKhoan);
            if (!exists) throw new KeyNotFoundException($"Không tìm thấy tài khoản {soTaiKhoan}.");

            _context.Entry(account).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAccountAsync(string soTaiKhoan)
        {
            var account = await _context.TaiKhoan.FindAsync(soTaiKhoan);
            if (account == null) throw new KeyNotFoundException($"Không tìm thấy tài khoản {soTaiKhoan}.");

            _context.TaiKhoan.Remove(account);
            await _context.SaveChangesAsync();
        }

        private static AccountDTO MapToDTO(TaiKhoan account)
        {
            return new AccountDTO
            {
                SoTaiKhoan = account.SoTaiKhoan,
                MaKH = account.MaKH,
                TenKhachHang = account.KhachHang?.HoTen ?? "N/A",
                MaCN = account.MaCN,
                TenChiNhanh = account.ChiNhanh?.TenCN ?? "N/A",
                LoaiTaiKhoan = account.LoaiTaiKhoan,
                SoDu = account.SoDu,
                NgayMoTK = account.NgayMoTK,
                TrangThai = account.TrangThai
            };
        }
    }
}
