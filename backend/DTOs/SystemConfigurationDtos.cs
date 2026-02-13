namespace Backend.DTOs;

public record CreateSystemConfigurationDto(
    string SystemKey,
    SystemConfigDataDto Configuration,
    string CreatedBy
);

public record UpdateSystemConfigurationDto(
    SystemConfigDataDto Configuration,
    string UpdatedBy
);

public record SystemConfigurationResponseDto(
    Guid Id,
    string SystemKey,
    int Version,
    bool IsActive,
    SystemConfigDataDto Configuration,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy
);

public record SystemConfigDataDto(
    string Icon,
    string Title,
    string TitleAr,
    string Description,
    List<PageConfigDto> Pages,
    List<PermissionConfigDto> Permissions
);

public record PageConfigDto(
    string PageKey,
    string Title,
    string TitleAr,
    FormConfigDto? Form,
    ListConfigDto? List,
    List<ExportCollectionDto> ExportCollections,
    PagePermissionsDto? Permissions
);

public record FormConfigDto(
    string Title,
    List<FieldConfigDto> Fields
);

public record FieldConfigDto(
    string FieldKey,
    string Label,
    string LabelAr,
    string FieldType,
    string? DefaultValue,
    string? Placeholder,
    List<FieldOptionDto>? Options,
    AutocompleteConfigDto? AutocompleteConfig,
    SliderConfigDto? SliderConfig,
    FieldValidationDto Validation,
    FieldPermissionDto? Permission,
    int Order
);

public record FieldOptionDto(string Value, string Label, string? LabelAr);

public record AutocompleteConfigDto(
    string SourceType,
    string? CollectionRef,
    string? DisplayField,
    string? ValueField,
    List<FieldOptionDto>? StaticOptions
);

public record SliderConfigDto(double Min, double Max, double Step);

public record FieldValidationDto(
    bool Required,
    int? MinLength,
    int? MaxLength,
    double? Min,
    double? Max,
    bool Unique,
    string? Regex,
    string? RegexMessage,
    bool DisabledOnEdit,
    List<CustomValidationRuleDto>? CustomRules
);

public record CustomValidationRuleDto(
    string RuleName,
    string? ErrorMessage,
    Dictionary<string, object>? Parameters
);

public record ListConfigDto(
    List<string> DisplayFields,
    List<ListColumnConfigDto>? Columns,
    bool EnableSearch,
    bool EnablePagination,
    int PageSize,
    string? DefaultSortField,
    string DefaultSortDirection
);

public record ListColumnConfigDto(
    string Key,
    string Header,
    string? HeaderAr,
    List<ListColumnFieldDto> Fields
);

public record ListColumnFieldDto(
    string FieldKey,
    string RenderAs,
    string? BadgeVariant
);

public record ExportCollectionDto(string CollectionName, List<string> Fields);

public record PermissionConfigDto(string UserId, string Role, List<string> AccessiblePages);

public record PagePermissionsDto(
    List<string> ListAccess,
    List<string> CreateAccess,
    List<string> EditAccess,
    List<string> DeleteAccess
);

public record FieldPermissionDto(List<string> ViewUsers, List<string> EditUsers);

public record SystemConfigurationSummaryDto(
    Guid Id,
    string SystemKey,
    int Version,
    bool IsActive,
    string Title,
    string TitleAr,
    string Icon,
    string Description,
    int PageCount,
    DateTime CreatedAt,
    string CreatedBy
);
