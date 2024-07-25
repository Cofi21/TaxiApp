﻿using Common.Enums;
using Microsoft.AspNetCore.Mvc;
using UserService.Database;
using System.Linq;
using System.Threading.Tasks;

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
        public IActionResult ApproveVerification(string email)
        {
            var user = _userDbContext.Users.SingleOrDefault(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.UserState = UserState.Verified;
            _userDbContext.Users.Update(user);
            _userDbContext.SaveChanges();

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
    }
}
