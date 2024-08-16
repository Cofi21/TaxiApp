using Microsoft.EntityFrameworkCore;
using Common.RideDTO;
using RideManagementService.Database.Models;

public class DriveDbContext : DbContext
{
    public DbSet<Drive> Drives { get; set; }
    public DbSet<DriverRating> DriverRating { get; set; }

    public DriveDbContext(DbContextOptions<DriveDbContext> options) : base(options) { }
}
