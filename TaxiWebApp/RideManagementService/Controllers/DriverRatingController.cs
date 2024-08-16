using Common.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RideManagementService.Database.Models;
using System.IdentityModel.Tokens.Jwt;

namespace RideManagementService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriverRatingController : ControllerBase
    {
        private readonly DriveDbContext _context;

        public DriverRatingController(DriveDbContext context)
        {
            _context = context;
        }

        [HttpGet("getAverageRating/{driverId}")]
        public async Task<ActionResult<double>> GetAverageRating(Guid driverId)
        {
            try
            {
                var driverRatings = await _context.DriverRating
                    .Where(dr => dr.DriverId == driverId)
                    .ToListAsync(); // Consider using ToListAsync() for async operations

                if (driverRatings == null || !driverRatings.Any())
                {
                    return Ok(0);
                }

                double sum = driverRatings.Sum(dr => dr.Rating);
                int driverRatingsCount = driverRatings.Count();

                // Ensure driverRatingsCount is not zero to avoid division by zero
                double averageRating = driverRatingsCount > 0 ? sum / driverRatingsCount : 0;

                return Ok(averageRating);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "Internal server error"); // Handle exception gracefully
            }
        }

        [HttpPost("createDriverRating")]
        public async Task<IActionResult> CreateDriverRating([FromBody] CreateRating createRatingDto)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            var claims = decodedToken.Claims.ToList();
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var drive = await _context.Drives.FirstOrDefaultAsync(d => d.Id == createRatingDto.DriveId);
            if (drive == null)
            {
                return NotFound(new { message = "Drive not found." });
            }

            var driverRating = new DriverRating
            {
                DriveId = createRatingDto.DriveId,
                DriverId = drive.DriverId,
                UserId = userId,
                Rating = createRatingDto.Rating,
                CreatedAt = DateTime.UtcNow,
            };

            await _context.DriverRating.AddAsync(driverRating);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rating created successfully." });
        }

    }
}
