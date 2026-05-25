using System;
using System.Security.Cryptography;
using System.Text;

namespace GTSmartBank.Helpers
{
    public static class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
                return string.Empty;

            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hashBytes = sha256.ComputeHash(bytes);
                
                var sb = new StringBuilder();
                foreach (var b in hashBytes)
                {
                    sb.Append(b.ToString("x2"));
                }
                return sb.ToString();
            }
        }

        public static bool VerifyPassword(string password, string storedPassword)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(storedPassword))
                return false;

            // Check if storedPassword is SHA-256 hash (64 chars hex) and matches the hash
            var hash = HashPassword(password);
            if (storedPassword.Equals(hash, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Fallback for legacy plain text passwords in database
            return storedPassword == password;
        }
    }
}
