using Common.Enums;

namespace UserService.Database
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public UserState UserState { get; set; }
        public UserType UserType { get; set; }
        public string ImageName { get; set; }
        public bool IsBlocked { get;set; }
    }
}
