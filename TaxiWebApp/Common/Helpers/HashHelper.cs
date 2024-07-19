using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Common.Helpers
{
    public static class HashHelper
    {
        private static readonly byte[] FixedSalt = Encoding.UTF8.GetBytes("57Ztaxgk418wsOpwHpQL");

        // Hashes a password with the fixed salt using SHA-256
        public static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var saltedPassword = new byte[FixedSalt.Length + Encoding.UTF8.GetByteCount(password)];
                Buffer.BlockCopy(FixedSalt, 0, saltedPassword, 0, FixedSalt.Length);
                Buffer.BlockCopy(Encoding.UTF8.GetBytes(password), 0, saltedPassword, FixedSalt.Length, Encoding.UTF8.GetByteCount(password));

                var hash = sha256.ComputeHash(saltedPassword);
                var hashWithSalt = new byte[hash.Length + FixedSalt.Length];
                Buffer.BlockCopy(hash, 0, hashWithSalt, 0, hash.Length);
                Buffer.BlockCopy(FixedSalt, 0, hashWithSalt, hash.Length, FixedSalt.Length);

                return Convert.ToBase64String(hashWithSalt);
            }
        }

        // Verifies a password against a stored hash
        public static bool VerifyPassword(string password, string storedHash)
        {
            var hashWithSaltBytes = Convert.FromBase64String(storedHash);
            var salt = new byte[FixedSalt.Length];
            Buffer.BlockCopy(hashWithSaltBytes, hashWithSaltBytes.Length - FixedSalt.Length, salt, 0, FixedSalt.Length);

            // Verify that the fixed salt matches
            if (!salt.SequenceEqual(FixedSalt))
            {
                return false;
            }

            var hashToVerify = HashPassword(password);

            return hashToVerify == storedHash;
        }
    }
}
