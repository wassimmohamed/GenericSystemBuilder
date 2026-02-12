namespace Backend.DTOs;

public record CreateDataEntryDto(
    Dictionary<string, object?> Data,
    string? CreatedBy
);

public record UpdateDataEntryDto(
    Dictionary<string, object?> Data,
    string? UpdatedBy
);

public record DataEntryResponseDto(
    Guid Id,
    string SystemKey,
    string PageKey,
    Dictionary<string, object?> Data,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy
);
