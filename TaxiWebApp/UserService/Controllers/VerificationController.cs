using Common.Enums;
using Microsoft.AspNetCore.Mvc;
using UserService.Database;
using System.Linq;
using System.Threading.Tasks;
using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VerificationController : ControllerBase
    {
        private readonly UserDbContext _userDbContext;

        public VerificationController(UserDbContext userDbContext)
        {
            _userDbContext = userDbContext;
        }

        [HttpGet("requests")]
        public IActionResult GetVerificationRequests()
        {
            var requests = _userDbContext.Users
                .Where(u => u.UserType == UserType.Driver && u.UserState == UserState.Created)
                .Select(u => new
                {
                    u.Email,
                    u.FirstName,
                    u.LastName
                })
                .ToList();

            return Ok(requests);
        }

        [HttpPost("approve/{email}")]
        public  IActionResult ApproveVerification(string email)
        {
            var user = _userDbContext.Users.SingleOrDefault(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.UserState = UserState.Verified;
            _userDbContext.Users.Update(user);
            _userDbContext.SaveChanges();

            EmailInfo emailInfo = new EmailInfo()
            {
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Id = user.Id,
                UserType = user.UserType.ToString()
            };

            var emailServiceProxy = ServiceProxy.Create<INotificationService>(
            new Uri("fabric:/TaxiWebApp/NotificationService")
           );

            var emailSent =  emailServiceProxy.DriverVerificationEmail(emailInfo);

            return Ok(new { message = "User approved" });
        }

        [HttpPost("reject/{email}")]
        public IActionResult RejectVerification(string email)
        {
            var user = _userDbContext.Users.SingleOrDefault(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.UserState = UserState.Rejected;
            _userDbContext.Users.Update(user);
            _userDbContext.SaveChanges();

            EmailInfo emailInfo = new EmailInfo()
            {
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Id = user.Id,
                UserType = user.UserType.ToString()
            };

            var emailServiceProxy = ServiceProxy.Create<INotificationService>(
            new Uri("fabric:/TaxiWebApp/NotificationService")
           );

            var emailSent = emailServiceProxy.DriverRejectionEmail(emailInfo);

            return Ok(new { message = "User rejected" });
        }

        [HttpGet("status/{email}")]
        public IActionResult GetVerificationStatus(string email)
        {
            var user = _userDbContext.Users.SingleOrDefault(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new { userState = user.UserState });
        }

        [HttpPost("block-driver/{driverId}")]
        public async Task<IActionResult> BlockDriver(Guid driverId)
        {
            try
            {
                var driver = await _userDbContext.Users.FindAsync(driverId);
                if (driver == null)
                {
                    return NotFound("Driver not found.");
                }

                driver.UserState = UserState.Blocked;

                _userDbContext.Users.Update(driver);
                await _userDbContext.SaveChangesAsync();

                return Ok(driver.UserState);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpPost("unblock-driver/{driverId}")]
        public async Task<IActionResult> UnblockDriver(Guid driverId)
        {
            try
            {
                var driver = await _userDbContext.Users.FindAsync(driverId);
                if (driver == null)
                {
                    return NotFound("Driver not found.");
                }

                driver.UserState = UserState.Verified;

                _userDbContext.Users.Update(driver);
                await _userDbContext.SaveChangesAsync();

                return Ok(driver.UserState);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "Internal server error");
            }
        }



    }
}
