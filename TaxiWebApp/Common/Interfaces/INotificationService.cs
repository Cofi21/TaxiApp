using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Interfaces
{
    public interface INotificationService : IService
    {
        Task<bool> UserRegistrationEmail(EmailInfo emailInfo);
        Task<bool> DriverVerificationEmail(EmailInfo emailInfo);
        Task<bool> DriverRejectionEmail(EmailInfo emailInfo);
    }
}
