using Common.Enums;
using Common.Helpers;
using Common.Interfaces;
using Common.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserService.Database;
using UserService.Models;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserDbContext _userDbContext;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly string _imagesFolderPath = @"C:\Users\bogda\Documents\GitHub\TaxiApp\TaxiWebApp\Images";

        public AuthController(UserDbContext userDbContext, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _userDbContext = userDbContext;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginUser loginDto)
        {
            var user = _userDbContext.Users.SingleOrDefault(u => u.Email == loginDto.Email);
            if (user == null || !HashHelper.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterUser registerDto)
        {
            if (_userDbContext.Users.Any(u => u.Email == registerDto.Email))
            {
                return BadRequest(new { message = "Email is already registered" });
            }

            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                return BadRequest(new { message = "Passwords do not match" });
            }

            var hashedPassword = HashHelper.HashPassword(registerDto.Password);

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = hashedPassword,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                UserState = UserState.Created,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow.AddHours(2),
                DateOfBirth = registerDto.DateOfBirth.Date,
                Address = registerDto.Address,
            };

            if (registerDto.UserType.Equals("Driver"))
            {
                user.UserType = UserType.Driver;
            }
            else if (registerDto.UserType.Equals("User"))
            {
                user.UserType = UserType.User;
            }

            if (user.UserType == UserType.User || user.UserType == UserType.Admin)
            {
                user.UserState = UserState.Verified;
            }

            user.ImageName = "";

            _userDbContext.Users.Add(user);
            _userDbContext.SaveChanges();

            var image = await SaveImage(registerDto.ImageFile, user.Id.ToString());
            user.ImageName = image;

            _userDbContext.Users.Update(user);
            _userDbContext.SaveChanges();


            EmailInfo emailInfo = new EmailInfo()
            {
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserType = user.UserType.ToString(),
                Id = user.Id
            };

            var emailServiceProxy = ServiceProxy.Create<INotificationService>(
                new Uri("fabric:/TaxiWebApp/NotificationService")
            );

            var emailSent = await emailServiceProxy.UserRegistrationEmail(emailInfo);

            var token = GenerateJwtToken(user);

            return Ok(new { token });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "Logout successful" });
        }

        [HttpPost("google-response")]
        public async Task<IActionResult> GoogleResponse([FromBody] string idToken)
        {
            var payload = await ValidateGoogleToken(idToken);

            if (payload == null)
            {
                return Unauthorized();
            }

            var email = payload.Email;
            var name = payload.Name;

            var existingUser = _userDbContext.Users.SingleOrDefault(u => u.Email == email);
            if (existingUser == null)
            {
                var newUser = new User
                {
                    Username = name,
                    Email = email,
                    UserType = UserType.User, // Default user type for Google sign-in
                    UserState = UserState.Verified,
                    CreatedAt = DateTime.UtcNow.AddHours(2),
                    ImageName = "" // Ovaj deo trebaš prilagoditi po potrebi
                };

                _userDbContext.Users.Add(newUser);
                await _userDbContext.SaveChangesAsync();
                var newToken = GenerateJwtToken(newUser);
                return Ok(new { token = newToken });
            }

            var token = GenerateJwtToken(existingUser);
            return Ok(new { token });
        }

        private async Task<GoogleJsonWebSignature.Payload> ValidateGoogleToken(string idToken)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new List<string> { "225755120679-jju20trm8lpt2c53oo5f0oghe54o4lqe.apps.googleusercontent.com" }
            };

            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
                return payload;
            }
            catch
            {
                return null;
            }
        }


        private string GenerateJwtToken(User user)
        {
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? string.Empty);
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.UserType.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpiresInMinutes"])),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [NonAction]
        public async Task<string> SaveImage(IFormFile imageFile, string userId)
        {
            string extension = Path.GetExtension(imageFile.FileName);
            string imageName = $"{userId}{extension}";
            var imagePath = Path.Combine(_imagesFolderPath, imageName);

            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
            }

            using (var fileStream = new FileStream(imagePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }

            return imageName;
        }
    }
}
