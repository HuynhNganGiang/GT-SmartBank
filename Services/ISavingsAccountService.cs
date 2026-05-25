using System.Collections.Generic;
using System.Threading.Tasks;
using GTSmartBank.DTOs;

namespace GTSmartBank.Services
{
    public interface ISavingsAccountService
    {
        Task<IEnumerable<SavingsAccountDTO>> GetAllSavingsAccountsAsync();
        Task<IEnumerable<SavingsAccountDTO>> GetSavingsAccountsByCustomerAsync(int customerId);
        Task<IEnumerable<SavingsAccountDTO>> GetSavingsAccountsByAccountAsync(string soTaiKhoan);
        Task<SavingsAccountDTO?> GetSavingsAccountDetailsAsync(string maSo);
        Task<SavingsAccountDTO> OpenSavingsAccountAsync(CreateSavingsAccountDTO request);
        Task<SavingsAccountDTO> SettleSavingsAccountAsync(string maSo);
    }
}
