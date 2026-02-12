using Backend.Data;
using Backend.DTOs;
using Backend.Mappings;
using Backend.Models;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints;

public static class SystemConfigurationEndpoints
{
    public static void MapSystemConfigurationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/system-configurations")
            .WithTags("System Configurations");

        // GET all active systems (latest versions)
        group.MapGet("/", async (AppDbContext db) =>
        {
            var systems = await db.SystemConfigurations
                .Where(s => s.IsActive)
                .GroupBy(s => s.SystemKey)
                .Select(g => g.OrderByDescending(s => s.Version).First())
                .ToListAsync();

            return Results.Ok(systems.Select(s => s.ToSummaryDto()));
        }).WithName("GetAllSystems").WithOpenApi();

        // GET system by key (latest version)
        group.MapGet("/{systemKey}", async (string systemKey, AppDbContext db) =>
        {
            var system = await db.SystemConfigurations
                .Where(s => s.SystemKey == systemKey && s.IsActive)
                .OrderByDescending(s => s.Version)
                .FirstOrDefaultAsync();

            return system is null
                ? Results.NotFound(new { message = $"System '{systemKey}' not found" })
                : Results.Ok(system.ToResponseDto());
        }).WithName("GetSystemByKey").WithOpenApi();

        // GET system by key and version
        group.MapGet("/{systemKey}/versions/{version:int}", async (string systemKey, int version, AppDbContext db) =>
        {
            var system = await db.SystemConfigurations
                .FirstOrDefaultAsync(s => s.SystemKey == systemKey && s.Version == version);

            return system is null
                ? Results.NotFound(new { message = $"System '{systemKey}' version {version} not found" })
                : Results.Ok(system.ToResponseDto());
        }).WithName("GetSystemByVersion").WithOpenApi();

        // GET all versions of a system
        group.MapGet("/{systemKey}/versions", async (string systemKey, AppDbContext db) =>
        {
            var versions = await db.SystemConfigurations
                .Where(s => s.SystemKey == systemKey)
                .OrderByDescending(s => s.Version)
                .ToListAsync();

            return Results.Ok(versions.Select(s => s.ToSummaryDto()));
        }).WithName("GetSystemVersions").WithOpenApi();

        // POST create new system
        group.MapPost("/", async (
            CreateSystemConfigurationDto dto,
            IValidator<CreateSystemConfigurationDto> validator,
            AppDbContext db) =>
        {
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            // Check if system key already exists
            var existing = await db.SystemConfigurations
                .AnyAsync(s => s.SystemKey == dto.SystemKey);
            if (existing)
            {
                return Results.Conflict(new { message = $"System '{dto.SystemKey}' already exists. Use PUT to update." });
            }

            var entity = new SystemConfiguration
            {
                SystemKey = dto.SystemKey,
                Version = 1,
                Configuration = dto.Configuration.ToModel(),
                CreatedBy = dto.CreatedBy
            };

            db.SystemConfigurations.Add(entity);
            await db.SaveChangesAsync();

            return Results.Created($"/api/system-configurations/{entity.SystemKey}", entity.ToResponseDto());
        }).WithName("CreateSystem").WithOpenApi();

        // PUT update system (creates new version)
        group.MapPut("/{systemKey}", async (
            string systemKey,
            UpdateSystemConfigurationDto dto,
            IValidator<UpdateSystemConfigurationDto> validator,
            AppDbContext db) =>
        {
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var latestVersion = await db.SystemConfigurations
                .Where(s => s.SystemKey == systemKey)
                .OrderByDescending(s => s.Version)
                .FirstOrDefaultAsync();

            if (latestVersion is null)
            {
                return Results.NotFound(new { message = $"System '{systemKey}' not found" });
            }

            // Deactivate old version
            latestVersion.IsActive = false;

            // Create new version
            var newVersion = new SystemConfiguration
            {
                SystemKey = systemKey,
                Version = latestVersion.Version + 1,
                Configuration = dto.Configuration.ToModel(),
                CreatedBy = latestVersion.CreatedBy,
                CreatedAt = latestVersion.CreatedAt,
                UpdatedBy = dto.UpdatedBy,
                UpdatedAt = DateTime.UtcNow
            };

            db.SystemConfigurations.Add(newVersion);
            await db.SaveChangesAsync();

            return Results.Ok(newVersion.ToResponseDto());
        }).WithName("UpdateSystem").WithOpenApi();

        // DELETE system (soft delete - deactivate all versions)
        group.MapDelete("/{systemKey}", async (string systemKey, AppDbContext db) =>
        {
            var systems = await db.SystemConfigurations
                .Where(s => s.SystemKey == systemKey)
                .ToListAsync();

            if (!systems.Any())
            {
                return Results.NotFound(new { message = $"System '{systemKey}' not found" });
            }

            foreach (var system in systems)
            {
                system.IsActive = false;
            }

            await db.SaveChangesAsync();

            return Results.NoContent();
        }).WithName("DeleteSystem").WithOpenApi();

        // GET export collection data
        group.MapGet("/{systemKey}/pages/{pageKey}/collections/{collectionName}", async (
            string systemKey, string pageKey, string collectionName, AppDbContext db) =>
        {
            var system = await db.SystemConfigurations
                .Where(s => s.SystemKey == systemKey && s.IsActive)
                .OrderByDescending(s => s.Version)
                .FirstOrDefaultAsync();

            if (system is null)
                return Results.NotFound(new { message = $"System '{systemKey}' not found" });

            var page = system.Configuration.Pages.FirstOrDefault(p => p.PageKey == pageKey);
            if (page is null)
                return Results.NotFound(new { message = $"Page '{pageKey}' not found" });

            var collection = page.ExportCollections.FirstOrDefault(c => c.CollectionName == collectionName);
            if (collection is null)
                return Results.NotFound(new { message = $"Collection '{collectionName}' not found" });

            return Results.Ok(new ExportCollectionDto(collection.CollectionName, collection.Fields));
        }).WithName("GetExportCollection").WithOpenApi();

        // GET user accessible systems
        group.MapGet("/user/{userId}/accessible", async (string userId, AppDbContext db) =>
        {
            var systems = await db.SystemConfigurations
                .Where(s => s.IsActive)
                .GroupBy(s => s.SystemKey)
                .Select(g => g.OrderByDescending(s => s.Version).First())
                .ToListAsync();

            var accessible = systems
                .Where(s => s.Configuration.Permissions.Any(p => p.UserId == userId))
                .Select(s => s.ToSummaryDto());

            return Results.Ok(accessible);
        }).WithName("GetAccessibleSystems").WithOpenApi();
    }
}
