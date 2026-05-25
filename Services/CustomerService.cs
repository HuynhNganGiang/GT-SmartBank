using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GTSmartBank.Data;
using GTSmartBank.DTOs;
using GTSmartBank.Helpers;
using GTSmartBank.Models;

namespace GTSmartBank.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CustomerDTO>> GetAllCustomersAsync()
        {
            var list = await _context.KhachHang.ToListAsync();
            return list.Select(MapToDTO);
        }

        public async Task<CustomerDTO?> GetCustomerByIdAsync(int id)
        {
            var kh = await _context.KhachHang.FindAsync(id);
            return kh == null ? null : MapToDTO(kh);
        }

        public async Task<CustomerDTO> CreateCustomerAsync(KhachHang customer)
        {
            if (customer == null) throw new ArgumentNullException(nameof(customer));
            if (string.IsNullOrWhiteSpace(customer.SoDienThoai)) throw new ArgumentException("Số điện thoại không được để trống.");

            var exists = await _context.KhachHang.AnyAsync(x => x.SoDienThoai == customer.SoDienThoai);
            if (exists) throw new InvalidOperationException($"Số điện thoại {customer.SoDienThoai} đã được đăng ký.");

            // Hash the password securely!
            customer.MatKhauHash = PasswordHasher.HashPassword(customer.MatKhauHash);
            customer.TrangThai = true;
            if (string.IsNullOrWhiteSpace(customer.Role))
            {
                customer.Role = "User";
            }

            _context.KhachHang.Add(customer);
            await _context.SaveChangesAsync();

            return MapToDTO(customer);
        }

        public async Task UpdateCustomerAsync(int id, KhachHang customer)
        {
            if (customer == null) throw new ArgumentNullException(nameof(customer));
            if (id != customer.MaKH) throw new ArgumentException("Mã khách hàng không khớp.");

            var dbCustomer = await _context.KhachHang.AsNoTracking().FirstOrDefaultAsync(x => x.MaKH == id);
            if (dbCustomer == null) throw new KeyNotFoundException($"Không tìm thấy khách hàng mã {id}.");

            // If the password was changed, hash it, otherwise preserve the old hash
            if (customer.MatKhauHash != dbCustomer.MatKhauHash && !string.IsNullOrWhiteSpace(customer.MatKhauHash))
            {
                customer.MatKhauHash = PasswordHasher.HashPassword(customer.MatKhauHash);
            }
            else
            {
                customer.MatKhauHash = dbCustomer.MatKhauHash;
            }

            _context.Entry(customer).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCustomerAsync(int id)
        {
            var customer = await _context.KhachHang.FindAsync(id);
            if (customer == null) throw new KeyNotFoundException($"Không tìm thấy khách hàng mã {id}.");

            _context.KhachHang.Remove(customer);
            await _context.SaveChangesAsync();
        }

        private static CustomerDTO MapToDTO(KhachHang customer)
        {
            return new CustomerDTO
            {
                MaKH = customer.MaKH,
                HoTen = customer.HoTen,
                CCCD = customer.CCCD,
                SoDienThoai = customer.SoDienThoai,
                Email = customer.Email,
                DiaChi = customer.DiaChi,
                Role = customer.Role,
                TrangThai = customer.TrangThai
            };
        }
    }
}
