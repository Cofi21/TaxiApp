using Common.RideDTO;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Interfaces
{
    public interface IRideAssignmentService : IService
    {
        Task<DriveStatus> AssignRideAsync();
        Task<DriveStatus> AcceptRideAsync();
        Task<DriveStatus> DeclineRideAsync();
    }
}
