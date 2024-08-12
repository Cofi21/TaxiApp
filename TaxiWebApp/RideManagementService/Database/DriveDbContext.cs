using Microsoft.EntityFrameworkCore;
using Common.RideDTO;

public class DriveDbContext : DbContext
{
    public DbSet<Drive> Drives { get; set; }

    public DriveDbContext(DbContextOptions<DriveDbContext> options) : base(options) { }
}
