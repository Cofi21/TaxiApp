using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Common.RideDTO;

namespace RideManagementService.Database.Configuration
{
    public class DriveConfiguration : IEntityTypeConfiguration<Drive>
    {
        public void Configure(EntityTypeBuilder<Drive> builder)
        {
            builder.HasKey(d => d.Id);

            builder.Property(d => d.Id)
                .IsRequired();

            builder.Property(d => d.UserId)
                .IsRequired();

            builder.Property(d => d.UserUsername)
               .IsRequired()
               .HasMaxLength(100);

            builder.Property(d => d.DriverId)
                .IsRequired();

            builder.Property(d => d.DriverUsername)
               .IsRequired()
               .HasMaxLength(100);

            builder.Property(d => d.AproximatedTime)
                .IsRequired();

            builder.Property(d => d.AproximatedCost)
                .IsRequired();

            builder.Property(d => d.CreatedAt)
                .IsRequired();

            builder.Property(d => d.DriveStatus)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(d => d.StartingAddress)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(d => d.EndingAddress)
                .IsRequired()
                .HasMaxLength(255);

        }
    } 
}
