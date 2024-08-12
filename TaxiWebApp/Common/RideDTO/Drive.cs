using Common.Enums;

namespace Common.RideDTO
{
    public class Drive
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserUsername { get; set; }
        public Guid DriverId { get; set; }
        public string DriverUsername { get; set; }
        public double AproximatedTime { get; set; }
        public double AproximatedCost { get; set; }
        public DateTime CreatedAt { get; set; }
        public DriveStatus DriveStatus { get; set; }
        public string StartingAddress { get; set; }
        public string EndingAddress { get; set; }
        public bool IsDeleted { get; set; }
    }
}
