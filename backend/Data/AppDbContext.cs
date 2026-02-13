using System.Text.Json;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<SystemConfiguration> SystemConfigurations => Set<SystemConfiguration>();
    public DbSet<DataEntry> DataEntries => Set<DataEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SystemConfiguration>(entity =>
        {
            entity.ToTable("system_configurations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SystemKey).IsRequired().HasMaxLength(100);

            entity.Property(e => e.Configuration)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, JsonOptions),
                    v => JsonSerializer.Deserialize<SystemConfigData>(v, JsonOptions) ?? new SystemConfigData()
                )
                .Metadata.SetValueComparer(new ValueComparer<SystemConfigData>(
                    (a, b) => JsonSerializer.Serialize(a, JsonOptions) == JsonSerializer.Serialize(b, JsonOptions),
                    v => JsonSerializer.Serialize(v, JsonOptions).GetHashCode(),
                    v => JsonSerializer.Deserialize<SystemConfigData>(JsonSerializer.Serialize(v, JsonOptions), JsonOptions)!
                ));

            entity.HasIndex(e => new { e.SystemKey, e.Version }).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        modelBuilder.Entity<DataEntry>(entity =>
        {
            entity.ToTable("data_entries");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SystemKey).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PageKey).IsRequired().HasMaxLength(100);

            entity.Property(e => e.Data)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, JsonOptions),
                    v => JsonSerializer.Deserialize<Dictionary<string, object?>>(v, JsonOptions) ?? new Dictionary<string, object?>()
                )
                .Metadata.SetValueComparer(new ValueComparer<Dictionary<string, object?>>(
                    (a, b) => JsonSerializer.Serialize(a, JsonOptions) == JsonSerializer.Serialize(b, JsonOptions),
                    v => JsonSerializer.Serialize(v, JsonOptions).GetHashCode(),
                    v => JsonSerializer.Deserialize<Dictionary<string, object?>>(JsonSerializer.Serialize(v, JsonOptions), JsonOptions)!
                ));

            entity.HasIndex(e => new { e.SystemKey, e.PageKey });
        });
    }
}
