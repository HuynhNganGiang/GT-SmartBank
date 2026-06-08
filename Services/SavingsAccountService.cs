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
    public class SavingsAccountService : ISavingsAccountService
    {
        private readonly AppDbContext _context;

        public SavingsAccountService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SavingsAccountDTO>> GetAllSavingsAccountsAsync()
        {
            var list = await _context.SoTietKiem
                .Include(s => s.TaiKhoan!)
                    .ThenInclude(t => t.KhachHang)
                .ToListAsync();

            return list.Select(MapToDTO);
        }

        public async Task<IEnumerable<SavingsAccountDTO>> GetSavingsAccountsByCustomerAsync(int customerId)
        {
            var list = await _context.SoTietKiem
                .Include(s => s.TaiKhoan!)
                    .ThenInclude(t => t.KhachHang)
                .Where(s => s.TaiKhoan != null && s.TaiKhoan.MaKH == customerId)
                .ToListAsync();

            return list.Select(MapToDTO);
        }

        public async Task<IEnumerable<SavingsAccountDTO>> GetSavingsAccountsByAccountAsync(string soTaiKhoan)
        {
            var list = await _context.SoTietKiem
                .Include(s => s.TaiKhoan!)
                    .ThenInclude(t => t.KhachHang)
                .Where(s => s.SoTaiKhoan == soTaiKhoan)
                .ToListAsync();

            return list.Select(MapToDTO);
        }

        public async Task<SavingsAccountDTO?> GetSavingsAccountDetailsAsync(string maSo)
        {
            var stk = await _context.SoTietKiem
                .Include(s => s.TaiKhoan!)
                    .ThenInclude(t => t.KhachHang)
                .FirstOrDefaultAsync(s => s.MaSo == maSo);

            return stk == null ? null : MapToDTO(stk);
        }

        public async Task<SavingsAccountDTO> OpenSavingsAccountAsync(CreateSavingsAccountDTO request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.SoTaiKhoan))
                throw new ArgumentException("Số tài khoản thanh toán không được để trống.");

            if (request.SoTienGoc < 1000000)
                throw new ArgumentException("Số tiền gửi tiết kiệm tối thiểu là 1,000,000 VND.");

            decimal laiSuat = request.KyHan switch
            {
                1 => 3.0m,
                3 => 3.5m,
                6 => 4.5m,
                12 => 5.5m,
                24 => 6.0m,
                _ => throw new ArgumentException("Kỳ hạn không hợp lệ. Chỉ hỗ trợ kỳ hạn 1, 3, 6, 12, 24 tháng.")
            };

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var account = await _context.TaiKhoan
                    .FirstOrDefaultAsync(t => t.SoTaiKhoan == request.SoTaiKhoan);

                if (account == null)
                    throw new KeyNotFoundException($"Không tìm thấy tài khoản nguồn {request.SoTaiKhoan}.");

                if (!account.TrangThai)
                    throw new InvalidOperationException("Tài khoản thanh toán nguồn hiện đang bị khóa.");

                if (account.SoDu < request.SoTienGoc)
                    throw new InvalidOperationException("Số dư tài khoản nguồn không đủ để mở sổ tiết kiệm.");

                account.SoDu -= request.SoTienGoc;
                _context.Entry(account).State = EntityState.Modified;

                var randomSuffix = new Random().Next(1000, 9999);
                var maSo = "STK" + DateTime.Now.ToString("yyMMdd") + randomSuffix;

                var now = DateTime.Now;

                var stk = new SoTietKiem
                {
                    MaSo = maSo,
                    SoTaiKhoan = request.SoTaiKhoan,
                    SoTienGoc = request.SoTienGoc,
                    KyHan = request.KyHan,
                    LaiSuat = laiSuat,
                    NgayMo = now,
                    NgayDaoHan = now.AddMonths(request.KyHan),
                    TrangThai = "HoatDong"
                };

                _context.SoTietKiem.Add(stk);

                var gd = new GiaoDich
                {
                    TK_Nguon = request.SoTaiKhoan,
                    TK_Dich = maSo,
                    SoTien = request.SoTienGoc,
                    ThoiGianGD = now,
                    LoaiGD = "MoSoTietKiem",
                    NoiDung = $"Mở sổ tiết kiệm {maSo} kỳ hạn {request.KyHan} tháng",
                    TrangThai = "ThanhCong"
                };

                _context.GiaoDich.Add(gd);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var created = await _context.SoTietKiem
                    .Include(s => s.TaiKhoan!)
                        .ThenInclude(t => t.KhachHang)
                    .FirstOrDefaultAsync(s => s.MaSo == maSo);

                return MapToDTO(created ?? stk);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<SavingsAccountDTO> SettleSavingsAccountAsync(string maSo)
        {
            if (string.IsNullOrWhiteSpace(maSo))
                throw new ArgumentException("Mã sổ tiết kiệm không được để trống.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var stk = await _context.SoTietKiem
                    .Include(s => s.TaiKhoan!)
                        .ThenInclude(t => t.KhachHang)
                    .FirstOrDefaultAsync(s => s.MaSo == maSo);

                if (stk == null)
                    throw new KeyNotFoundException($"Không tìm thấy sổ tiết kiệm {maSo}.");

                if (stk.TrangThai != "HoatDong")
                    throw new InvalidOperationException("Sổ tiết kiệm đã được tất toán hoặc không hoạt động.");

                var account = stk.TaiKhoan;

                if (account == null)
                {
                    account = await _context.TaiKhoan
                        .FirstOrDefaultAsync(t => t.SoTaiKhoan == stk.SoTaiKhoan);

                    if (account == null)
                        throw new KeyNotFoundException($"Không tìm thấy tài khoản thanh toán nhận tiền {stk.SoTaiKhoan}.");
                }

                if (!account.TrangThai)
                    throw new InvalidOperationException("Tài khoản thanh toán nhận tiền đang bị khóa.");

                var now = DateTime.Now;
                decimal lai;

                if (now >= stk.NgayDaoHan)
                {
                    lai = stk.SoTienGoc * (stk.LaiSuat / 100m) * (stk.KyHan / 12.0m);
                }
                else
                {
                    var daysDiff = (decimal)(now - stk.NgayMo).TotalDays;
                    if (daysDiff < 0) daysDiff = 0;

                    lai = stk.SoTienGoc * 0.005m * (daysDiff / 365.0m);
                }

                var tongNhan = stk.SoTienGoc + lai;

                account.SoDu += tongNhan;
                _context.Entry(account).State = EntityState.Modified;

                stk.TrangThai = "DaTatToan";
                stk.NgayDaoHan = now;
                _context.Entry(stk).State = EntityState.Modified;

                var gd = new GiaoDich
                {
                    TK_Nguon = stk.SoTaiKhoan,
                    TK_Dich = stk.SoTaiKhoan,
                    SoTien = tongNhan,
                    ThoiGianGD = now,
                    LoaiGD = "TatToanTietKiem",
                    NoiDung = $"Tất toán sổ tiết kiệm {maSo} (Gốc: {stk.SoTienGoc:N0}, Lãi: {lai:N0})",
                    TrangThai = "ThanhCong"
                };

                _context.GiaoDich.Add(gd);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return MapToDTO(stk);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static SavingsAccountDTO MapToDTO(SoTietKiem stk)
        {
            return new SavingsAccountDTO
            {
                MaSo = stk.MaSo,
                SoTaiKhoan = stk.SoTaiKhoan,

                MaKH = stk.TaiKhoan?.MaKH,
                HoTen = stk.TaiKhoan?.KhachHang?.HoTen,
                CCCD = stk.TaiKhoan?.KhachHang?.CCCD,

                SoTienGoc = stk.SoTienGoc,
                KyHan = stk.KyHan,
                LaiSuat = stk.LaiSuat,
                NgayMo = stk.NgayMo,
                NgayDaoHan = stk.NgayDaoHan,
                TrangThai = stk.TrangThai
            };
        }
    }
}