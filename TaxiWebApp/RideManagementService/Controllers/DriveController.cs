using Common.Interfaces;
using Common.RideDTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System;
using System.Collections.Generic;
using System.Fabric.Query;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Xml;

namespace RideManagementService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DriveController : ControllerBase
    {
        private readonly DriveDbContext _context;

        public DriveController(DriveDbContext context)
        {
            _context = context;
        }

        [HttpGet("get-all-drives")]
        public async Task<ActionResult<IEnumerable<Drive>>> GetAllDrives()
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var drives = await _context.Drives.Where(d => !d.IsDeleted).ToListAsync();
            return Ok(drives);
        }

         [HttpGet("all-driver-drives")]
        public async Task<ActionResult<IEnumerable<Drive>>> GetAllDrivesByUser()
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            // Get all drives for the user
            var userDrives = await _context.Drives.Where(d => d.DriverId == userId && !d.IsDeleted && d.DriveStatus == DriveStatus.DriveCompleted).ToListAsync();

            return Ok(userDrives);
        }

        [HttpGet("user-drives")]
        public async Task<ActionResult<IEnumerable<Drive>>> GetDrivesByUser()
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            // Get all drives for the user
            var userDrives = await _context.Drives.Where(d => d.UserId == userId && !d.IsDeleted && (d.DriveStatus == DriveStatus.DriveCompleted || d.DriveStatus == DriveStatus.UserDeclinedDrive)).ToListAsync();

            return Ok(userDrives);
        }

        [HttpGet("new-driver-drives")]
        public async Task<ActionResult<IEnumerable<Drive>>> GetNewDriverDrives()
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var drives = await _context.Drives
                                       .Where(d => d.DriveStatus == DriveStatus.UserOrderedDrive && !d.IsDeleted)
                                       .ToListAsync();
            return Ok(drives);
        }


        [HttpPost("create-drive")]
        public async Task<ActionResult<Drive>> CreateDrive([FromBody] CreateDrive createDriveDto)
        {
            try
            {
                var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                var tokenHandler = new JwtSecurityTokenHandler();
                var decodedToken = tokenHandler.ReadJwtToken(jwtToken);
                var claims = decodedToken.Claims.ToList();
                var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    Console.WriteLine("Invalid token.");
                    return Unauthorized(new { message = "Invalid token." });
                }

                if (createDriveDto == null)
                {
                    Console.WriteLine("Drive data is null");
                    return BadRequest("Drive data is null");
                }

                var usersDrives = _context.Drives.Where(d => d.UserId == userId);
                foreach (var usersDrive in usersDrives)
                {
                    if (usersDrive.DriveStatus == DriveStatus.UserOrderedDrive ||
                        usersDrive.DriveStatus == DriveStatus.DriverCreatedOffer ||
                        usersDrive.DriveStatus == DriveStatus.UserAceptedDrive ||
                        usersDrive.DriveStatus == DriveStatus.DriveActive)
                    {
                        Console.WriteLine("Conflict: You already have unfinished drives!");
                        return Conflict("You already have unfinished drives!");
                    }
                }

                Console.WriteLine("Creating new drive...");
                Drive drive = new Drive()
                {
                    StartingAddress = createDriveDto.StartingAddress,
                    EndingAddress = createDriveDto.EndingAddress,
                    CreatedAt = DateTime.Now.AddHours(2),
                    UserUsername = createDriveDto.UserUsername,
                    DriverUsername = "",
                    DriveStatus = DriveStatus.UserOrderedDrive,
                    UserId = userId // Directly assigning userId
                };

                _context.Drives.Add(drive);
                await _context.SaveChangesAsync();

                Console.WriteLine("Drive created successfully with ID: " + drive.Id);
                return CreatedAtAction(nameof(GetDriveById), new { id = drive.Id }, drive);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception: " + ex.Message);
                return StatusCode(500, "An error occurred while creating the drive: " + ex.Message);
            }
        }

        [HttpGet("drive/{id}")]
        public async Task<ActionResult<Drive>> GetDriveById(Guid id)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var drive = await _context.Drives.FindAsync(id);

            if (drive == null)
            {
                return NotFound();
            }

            return Ok(drive);
        }
        [HttpPost("create-offer/{id}")]
        public async Task<ActionResult<Drive>> DriverMakesOffer(Guid id, [FromBody] CreateOffer createOfferDto)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var drive = await _context.Drives.FindAsync(id);

            if(drive.DriveStatus == DriveStatus.DriverCreatedOffer)
            {
                return Unauthorized(new { message = "Driver allready created offer." });
            }

            if (drive == null)
            {
                return NotFound();
            }

            try
            {

                ServicePartitionKey partition = new ServicePartitionKey(long.Parse("1"));
                var statefulProxy = ServiceProxy.Create<IRideAssignmentService>(
                    new Uri("fabric:/TaxiWebApp/RideAssignmentService"),
                    partition
                );
                Console.WriteLine($"Proces pokrenut: {statefulProxy}");
                var result = await statefulProxy.AssignRideAsync();


                Console.WriteLine($"Result: {result}");

                Random rand = new Random();
                drive.AproximatedCost = rand.Next(100, 2000);
                drive.AproximatedTime = rand.Next(3, 10);
                drive.DriverId = userId;
                drive.DriverUsername = createOfferDto.DriverUsername; // use the provided DriverUsername
                drive.DriveStatus = result;

                await _context.SaveChangesAsync();

                return Ok(drive);
            }
            catch (Exception ex)
            {
                // Logujte ili vratite grešku
                return StatusCode(500, new { message = $"An error occurred: {ex.Message}" });
            }

           
        }

        [HttpPost("accept-drive/{id}")]
        public async Task<ActionResult<Drive>> UserAceptDrive(Guid id)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var drive = await _context.Drives.FindAsync(id);

            if (drive == null)
            {
                return NotFound();
            }

            ServicePartitionKey partition = new ServicePartitionKey(long.Parse("1"));
            var statefulProxy = ServiceProxy.Create<IRideAssignmentService>(
                new Uri("fabric:/TaxiWebApp/RideAssignmentService"),
                partition
            );
            var result = await statefulProxy.AcceptRideAsync();

             drive.DriveStatus = result;
            await _context.SaveChangesAsync();

            return Ok(drive);
        }


        [HttpPost("decline-drive/{id}")]
        public async Task<ActionResult<Drive>> UserDeclineDrive(Guid id)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var drive = await _context.Drives.FindAsync(id);

            if (drive == null)
            {
                return NotFound();
            }


            ServicePartitionKey partition = new ServicePartitionKey(long.Parse("1"));
            var statefulProxy = ServiceProxy.Create<IRideAssignmentService>(
                new Uri("fabric:/TaxiWebApp/RideAssignmentService"),
                partition
            );
            Console.WriteLine($"Proces pokrenut: {statefulProxy}");
            var result = await statefulProxy.DeclineRideAsync();

            drive.DriveStatus = result;
            await _context.SaveChangesAsync();

            return Ok(drive);
        }

        [HttpPost("drive-arrived/{id}")]
        public async Task<ActionResult<Drive>> DriveArrivedForUser(Guid id)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var drive = await _context.Drives.FindAsync(id);
            if (drive == null)
            {
                return NotFound();
            }

            drive.DriveStatus = DriveStatus.DriveActive;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("drive-completed/{id}")]
        public async Task<ActionResult<Drive>> DriveCompleted(Guid id)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var drive = await _context.Drives.FindAsync(id);
            if (drive == null)
            {
                return NotFound();
            }

            drive.DriveStatus = DriveStatus.DriveCompleted;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("current-user-drive")]
        public async Task<ActionResult<Drive>> GetCurrentDriveByUser()
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            // Get the current active drive for the user
            var currentUserDrive = await _context.Drives
                                                 .Where(d => d.UserId == userId && !d.IsDeleted && d.DriveStatus != DriveStatus.DriveCompleted && d.DriveStatus != DriveStatus.UserDeclinedDrive)
                                                 .FirstOrDefaultAsync();

            if (currentUserDrive == null)
            {
                return NotFound(new { message = "No active drive found for the user." });
            }

            return Ok(currentUserDrive);
        }

        [HttpGet("current-driver-drive")]
        public async Task<ActionResult<Drive>> GetCurrentDriveByDriver()
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var driverId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            // Get the current active drive for the user
            var currentUserDrive = await _context.Drives
                                                 .Where(d => d.DriverId == driverId && !d.IsDeleted && (d.DriveStatus == DriveStatus.UserAceptedDrive || d.DriveStatus == DriveStatus.DriveActive ))
                                                 .FirstOrDefaultAsync();

            if (currentUserDrive == null)
            {
                return NotFound(new { message = "No active drive found for the driver." });
            }

            return Ok(currentUserDrive);
        }


    }
}
