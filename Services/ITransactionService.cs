using System.Collections.Generic;
using System.Threading.Tasks;
using GTSmartBank.DTOs;
using GTSmartBank.Models;

namespace GTSmartBank.Services
{
    public interface ITransactionService
    {
        Task<GiaoDich> TransferAsync(string tkNguon, string tkDich, decimal soTien, string? noiDung, string otpCode);
        Task<IEnumerable<TransactionDTO>> GetAllTransactionsAsync();
        Task<IEnumerable<TransactionDTO>> GetTransactionsByAccountAsync(string soTaiKhoan);
        Task<IEnumerable<TransactionDTO>> GetTransactionsByCustomerAsync(int maKH);
    }
}
