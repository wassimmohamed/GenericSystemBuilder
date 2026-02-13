using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints;

public static class DataEntryEndpoints
{
    public static void MapDataEntryEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/data")
            .WithTags("Data Entries")
            .RequireAuthorization();

        // GET all entries for a system/page
        group.MapGet("/{systemKey}/{pageKey}", async (
            string systemKey, string pageKey, AppDbContext db) =>
        {
            var entries = await db.DataEntries
                .Where(e => e.SystemKey == systemKey && e.PageKey == pageKey)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            var result = entries.Select(e => new DataEntryResponseDto(
                e.Id, e.SystemKey, e.PageKey, e.Data,
                e.CreatedAt, e.CreatedBy, e.UpdatedAt, e.UpdatedBy
            ));

            return Results.Ok(result);
        }).WithName("GetDataEntries").WithOpenApi();

        // GET single entry by id
        group.MapGet("/{systemKey}/{pageKey}/{id:guid}", async (
            string systemKey, string pageKey, Guid id, AppDbContext db) =>
        {
            var entry = await db.DataEntries.FindAsync(id);
            if (entry is null || entry.SystemKey != systemKey || entry.PageKey != pageKey)
                return Results.NotFound(new { message = "Entry not found" });

            return Results.Ok(new DataEntryResponseDto(
                entry.Id, entry.SystemKey, entry.PageKey, entry.Data,
                entry.CreatedAt, entry.CreatedBy, entry.UpdatedAt, entry.UpdatedBy
            ));
        }).WithName("GetDataEntry").WithOpenApi();

        // POST create entry
        group.MapPost("/{systemKey}/{pageKey}", async (
            string systemKey, string pageKey,
            CreateDataEntryDto dto, AppDbContext db) =>
        {
            try
            {

            
            var entry = new DataEntry
            {
                SystemKey = systemKey,
                PageKey = pageKey,
                Data = dto.Data,
                CreatedBy = dto.CreatedBy ?? "system"
            };

            db.DataEntries.Add(entry);
            await db.SaveChangesAsync();

            var result = new DataEntryResponseDto(
                entry.Id, entry.SystemKey, entry.PageKey, entry.Data,
                entry.CreatedAt, entry.CreatedBy, entry.UpdatedAt, entry.UpdatedBy
            );

            return Results.Created($"/api/data/{systemKey}/{pageKey}/{entry.Id}", result);
            }
            catch (Exception ex)
            {

                throw;
            }
        }).WithName("CreateDataEntry").WithOpenApi();

        // PUT update entry
        group.MapPut("/{systemKey}/{pageKey}/{id:guid}", async (
            string systemKey, string pageKey, Guid id,
            UpdateDataEntryDto dto, AppDbContext db) =>
        {
            var entry = await db.DataEntries.FindAsync(id);
            if (entry is null || entry.SystemKey != systemKey || entry.PageKey != pageKey)
                return Results.NotFound(new { message = "Entry not found" });

            entry.Data = dto.Data;
            entry.UpdatedBy = dto.UpdatedBy ?? "system";
            entry.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            return Results.Ok(new DataEntryResponseDto(
                entry.Id, entry.SystemKey, entry.PageKey, entry.Data,
                entry.CreatedAt, entry.CreatedBy, entry.UpdatedAt, entry.UpdatedBy
            ));
        }).WithName("UpdateDataEntry").WithOpenApi();

        // DELETE entry
        group.MapDelete("/{systemKey}/{pageKey}/{id:guid}", async (
            string systemKey, string pageKey, Guid id, AppDbContext db) =>
        {
            var entry = await db.DataEntries.FindAsync(id);
            if (entry is null || entry.SystemKey != systemKey || entry.PageKey != pageKey)
                return Results.NotFound(new { message = "Entry not found" });

            db.DataEntries.Remove(entry);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).WithName("DeleteDataEntry").WithOpenApi();

        // GET collection data (projected entries for export collections)
        group.MapGet("/{systemKey}/{pageKey}/collections/{collectionName}", async (
            string systemKey, string pageKey, string collectionName,
            AppDbContext db) =>
        {
            // 1. Find the system config to get the collection field list
            var system = await db.SystemConfigurations
                .Where(s => s.SystemKey == systemKey && s.IsActive)
                .OrderByDescending(s => s.Version)
                .FirstOrDefaultAsync();

            if (system is null)
                return Results.NotFound(new { message = $"System '{systemKey}' not found" });

            var page = system.Configuration.Pages.FirstOrDefault(p => p.PageKey == pageKey);
            if (page is null)
                return Results.NotFound(new { message = $"Page '{pageKey}' not found" });

            var collection = page.ExportCollections.FirstOrDefault(
                c => string.Equals(c.CollectionName, collectionName, StringComparison.OrdinalIgnoreCase));
            if (collection is null)
                return Results.NotFound(new { message = $"Collection '{collectionName}' not found" });

            // 2. Get all data entries for this page
            var entries = await db.DataEntries
                .Where(e => e.SystemKey == systemKey && e.PageKey == pageKey)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            // 3. Project only the collection fields
            var projected = entries.Select(e =>
            {
                var item = new Dictionary<string, object?> { ["id"] = e.Id };
                foreach (var field in collection.Fields)
                {
                    item[field] = e.Data.TryGetValue(field, out var val) ? val : null;
                }
                return item;
            });

            return Results.Ok(projected);
        }).WithName("GetCollectionData").WithOpenApi();
    }
}
