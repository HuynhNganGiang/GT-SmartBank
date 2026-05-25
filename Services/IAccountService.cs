using System.Collections.Generic;
using System.Threading.Tasks;
using GTSmartBank.DTOs;
using GTSmartBank.Models;

namespace GTSmartBank.Services
{
    public interface IAccountService
    {
        Task<IEnumerable<AccountDTO>> GetAllAccountsAsync();
        Task<AccountDTO?> GetAccountDetailsAsync(string soTaiKhoan);
        Task<TaiKhoan?> GetAccountByNumberAsync(string soTaiKhoan);
        Task<AccountDTO> CreateAccountAsync(TaiKhoan account);
        Task UpdateAccountAsync(string soTaiKhoan, TaiKhoan account);
        Task DeleteAccountAsync(string soTaiKhoan);
    }
}
