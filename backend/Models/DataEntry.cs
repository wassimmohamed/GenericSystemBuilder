using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class DataEntry
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string SystemKey { get; set; } = string.Empty;

    [Required]
    public string PageKey { get; set; } = string.Empty;

    [Column(TypeName = "jsonb")]
    public Dictionary<string, object?> Data { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string CreatedBy { get; set; } = string.Empty;

    public DateTime? UpdatedAt { get; set; }

    public string? UpdatedBy { get; set; }
}
