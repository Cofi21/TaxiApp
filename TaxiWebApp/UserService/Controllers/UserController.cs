using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Database;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly string _imageFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
        private readonly UserDbContext dbContext;

        public UserController(UserDbContext userDbContext)
        {
            // if (!Directory.Exists(_imageFolderPath))
            //  {
            //    Directory.CreateDirectory(_imageFolderPath);
            //  }
            dbContext = userDbContext;

        }

        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var filePath = Path.Combine(_imageFolderPath, file.FileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { FilePath = filePath });
        }
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await dbContext.Users.ToListAsync();
            return Ok(users);
        }
    }
}
