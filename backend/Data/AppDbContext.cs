using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<SystemConfiguration> SystemConfigurations => Set<SystemConfiguration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SystemConfiguration>(entity =>
        {
            entity.ToTable("system_configurations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SystemKey).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Configuration).HasColumnType("jsonb");
            entity.HasIndex(e => new { e.SystemKey, e.Version }).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });
    }
}
