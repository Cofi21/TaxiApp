namespace Common.RideDTO { 
    public class CreateOffer
    {
        public Guid DriveId { get; set; }   
        public string DriverUsername { get; set; }
        public Guid DriverId { get; set; }
    }
}
