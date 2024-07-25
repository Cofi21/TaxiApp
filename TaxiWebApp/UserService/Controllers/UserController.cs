using Common.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UserService.Database;
using UserService.Models;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        
        private readonly string _imagesFolderPath = @"C:\Users\bogda\Documents\GitHub\TaxiApp\TaxiWebApp\Images";

        private readonly UserDbContext dbContext;

        public UserController(UserDbContext userDbContext)
        {
             if (!Directory.Exists(_imagesFolderPath))
              {
                Directory.CreateDirectory(_imagesFolderPath);
              }
            dbContext = userDbContext;

        }

        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var filePath = Path.Combine(_imagesFolderPath, file.FileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { FilePath = filePath });
        }
        [NonAction]
        public async Task<string> SaveImage(IFormFile imageFile, string userId, string currentImageName)
        {
            string extension = Path.GetExtension(imageFile.FileName);
            string imageName = $"{userId}{extension}";
            var imagePath = Path.Combine(_imagesFolderPath, imageName);

            var existingFiles = Directory.GetFiles(_imagesFolderPath, $"{userId}.*");
            foreach (var file in existingFiles)
            {
                if (Path.GetFileName(file) != imageName)
                {
                    try
                    {
                        System.IO.File.Delete(file);
                        Console.WriteLine($"Existing image {file} deleted successfully.");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error deleting image {file}: {ex.Message}");
                    }
                }
            }

            using (var fileStream = new FileStream(imagePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }
            return imageName;
        }


        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await dbContext.Users.ToListAsync();
            return Ok(users);
        }
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = dbContext.Users
                .Select(u => new
                {
                    u.Username,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.DateOfBirth,
                    u.Address,
                    u.UserType,
                    u.ImageName,
                    u.UserState
                })
                .SingleOrDefault(u => u.Email == email);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }



        [HttpGet("get-image/{imageName}")]
        public IActionResult GetImage(string imageName)
        {
            var imageFile = Directory.EnumerateFiles(_imagesFolderPath, imageName + ".*").FirstOrDefault();

            if (imageFile == null)
            {
                return NotFound();
            }

            string mimeType;
            var extension = Path.GetExtension(imageFile).ToLowerInvariant();
            switch (extension)
            {
                case ".jpeg":
                case ".jpg":
                    mimeType = "image/jpeg";
                    break;
                case ".png":
                    mimeType = "image/png";
                    break;
                default:
                    mimeType = "application/octet-stream";
                    break;
            }

            var image = System.IO.File.OpenRead(imageFile);
            return File(image, mimeType);
        }
        [HttpPut("edit-profile")]
        public async Task<IActionResult> EditProfile([FromForm] RegisterUser registerDto)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var existingUser = dbContext.Users.SingleOrDefault(u => u.Email == email);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Update user properties
            existingUser.FirstName = registerDto.FirstName;
            existingUser.LastName = registerDto.LastName;
            existingUser.DateOfBirth = registerDto.DateOfBirth;
            existingUser.Address = registerDto.Address;
            existingUser.Username = registerDto.Username;

            // Handle password update
            if (!string.IsNullOrEmpty(registerDto.Password) && registerDto.Password == registerDto.ConfirmPassword)
            {
                existingUser.PasswordHash = HashHelper.HashPassword(registerDto.Password);
                   
            }
            else if (!string.IsNullOrEmpty(registerDto.Password) || !string.IsNullOrEmpty(registerDto.ConfirmPassword))
            {
                return BadRequest(new { message = "Passwords do not match" });
            }

            // Handle image file
            if (registerDto.ImageFile != null)
            {
                var image = await SaveImage(registerDto.ImageFile, existingUser.Id.ToString(), existingUser.ImageName);
                existingUser.ImageName = image;
            }

            dbContext.Users.Update(existingUser);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }



    }
}
