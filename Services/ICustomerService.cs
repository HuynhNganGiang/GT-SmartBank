using System.Collections.Generic;
using System.Threading.Tasks;
using GTSmartBank.DTOs;
using GTSmartBank.Models;

namespace GTSmartBank.Services
{
    public interface ICustomerService
    {
        Task<IEnumerable<CustomerDTO>> GetAllCustomersAsync();
        Task<CustomerDTO?> GetCustomerByIdAsync(int id);
        Task<CustomerDTO> CreateCustomerAsync(KhachHang customer);
        Task UpdateCustomerAsync(int id, KhachHang customer);
        Task DeleteCustomerAsync(int id);
    }
}
