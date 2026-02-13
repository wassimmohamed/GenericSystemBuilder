using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class SystemConfiguration
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string SystemKey { get; set; } = string.Empty;
    
    public int Version { get; set; } = 1;
    
    public bool IsActive { get; set; } = true;
    
    [Column(TypeName = "jsonb")]
    public SystemConfigData Configuration { get; set; } = new();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public string CreatedBy { get; set; } = string.Empty;
    
    public DateTime? UpdatedAt { get; set; }
    
    public string? UpdatedBy { get; set; }
}

public class SystemConfigData
{
    public string Icon { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<PageConfig> Pages { get; set; } = new();
    public List<PermissionConfig> Permissions { get; set; } = new();
}

public class PageConfig
{
    public string PageKey { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public FormConfig? Form { get; set; }
    public ListConfig? List { get; set; }
    public List<ExportCollection> ExportCollections { get; set; } = new();
    public PagePermissions? Permissions { get; set; }
}

public class FormConfig
{
    public string Title { get; set; } = string.Empty;
    public List<FieldConfig> Fields { get; set; } = new();
}

public class FieldConfig
{
    public string FieldKey { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string LabelAr { get; set; } = string.Empty;
    public string FieldType { get; set; } = "Text";
    public string? DefaultValue { get; set; }
    public string? Placeholder { get; set; }
    public List<FieldOption>? Options { get; set; }
    public AutocompleteConfig? AutocompleteConfig { get; set; }
    public SliderConfig? SliderConfig { get; set; }
    public FieldValidation Validation { get; set; } = new();
    public FieldPermission? Permission { get; set; }
    public int Order { get; set; }
}

public class FieldOption
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? LabelAr { get; set; }
}

public class AutocompleteConfig
{
    public string SourceType { get; set; } = "Static";
    public string? CollectionRef { get; set; }
    public string? DisplayField { get; set; }
    public string? ValueField { get; set; }
    public List<FieldOption>? StaticOptions { get; set; }
}

public class SliderConfig
{
    public double Min { get; set; }
    public double Max { get; set; }
    public double Step { get; set; } = 1;
}

public class FieldValidation
{
    public bool Required { get; set; }
    public int? MinLength { get; set; }
    public int? MaxLength { get; set; }
    public double? Min { get; set; }
    public double? Max { get; set; }
    public bool Unique { get; set; }
    public string? Regex { get; set; }
    public string? RegexMessage { get; set; }
    public bool DisabledOnEdit { get; set; }
    public List<CustomValidationRule>? CustomRules { get; set; }
}

public class CustomValidationRule
{
    public string RuleName { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object>? Parameters { get; set; }
}

public class ListConfig
{
    public List<string> DisplayFields { get; set; } = new();
    public List<ListColumnConfig> Columns { get; set; } = new();
    public bool EnableSearch { get; set; } = true;
    public bool EnablePagination { get; set; } = true;
    public int PageSize { get; set; } = 10;
    public string? DefaultSortField { get; set; }
    public string DefaultSortDirection { get; set; } = "asc";
}

public class ListColumnConfig
{
    public string Key { get; set; } = string.Empty;
    public string Header { get; set; } = string.Empty;
    public string? HeaderAr { get; set; }
    public List<ListColumnField> Fields { get; set; } = new();
}

public class ListColumnField
{
    public string FieldKey { get; set; } = string.Empty;
    public string RenderAs { get; set; } = "text";
    public string? BadgeVariant { get; set; }
}

public class ExportCollection
{
    public string CollectionName { get; set; } = string.Empty;
    public List<string> Fields { get; set; } = new();
}

public class PermissionConfig
{
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public List<string> AccessiblePages { get; set; } = new();
}

public class PagePermissions
{
    public List<string> ListAccess { get; set; } = new();
    public List<string> CreateAccess { get; set; } = new();
    public List<string> EditAccess { get; set; } = new();
    public List<string> DeleteAccess { get; set; } = new();
}

public class FieldPermission
{
    public List<string> ViewUsers { get; set; } = new();
    public List<string> EditUsers { get; set; } = new();
}
