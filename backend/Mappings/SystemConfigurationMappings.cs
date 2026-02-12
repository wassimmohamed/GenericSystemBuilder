using Backend.DTOs;
using Backend.Models;

namespace Backend.Mappings;

public static class SystemConfigurationMappings
{
    public static SystemConfigurationResponseDto ToResponseDto(this SystemConfiguration entity)
    {
        return new SystemConfigurationResponseDto(
            entity.Id,
            entity.SystemKey,
            entity.Version,
            entity.IsActive,
            entity.Configuration.ToDto(),
            entity.CreatedAt,
            entity.CreatedBy,
            entity.UpdatedAt,
            entity.UpdatedBy
        );
    }

    public static SystemConfigurationSummaryDto ToSummaryDto(this SystemConfiguration entity)
    {
        return new SystemConfigurationSummaryDto(
            entity.Id,
            entity.SystemKey,
            entity.Version,
            entity.IsActive,
            entity.Configuration.Title,
            entity.Configuration.TitleAr,
            entity.Configuration.Icon,
            entity.Configuration.Description,
            entity.Configuration.Pages.Count,
            entity.CreatedAt,
            entity.CreatedBy
        );
    }

    public static SystemConfigData ToModel(this SystemConfigDataDto dto)
    {
        return new SystemConfigData
        {
            Icon = dto.Icon,
            Title = dto.Title,
            TitleAr = dto.TitleAr,
            Description = dto.Description,
            Pages = dto.Pages.Select(p => p.ToModel()).ToList(),
            Permissions = dto.Permissions.Select(p => new PermissionConfig
            {
                UserId = p.UserId,
                Role = p.Role,
                AccessiblePages = p.AccessiblePages
            }).ToList()
        };
    }

    public static SystemConfigDataDto ToDto(this SystemConfigData model)
    {
        return new SystemConfigDataDto(
            model.Icon,
            model.Title,
            model.TitleAr,
            model.Description,
            model.Pages.Select(p => p.ToDto()).ToList(),
            model.Permissions.Select(p => new PermissionConfigDto(p.UserId, p.Role, p.AccessiblePages)).ToList()
        );
    }

    private static PageConfig ToModel(this PageConfigDto dto)
    {
        return new PageConfig
        {
            PageKey = dto.PageKey,
            Title = dto.Title,
            TitleAr = dto.TitleAr,
            Form = dto.Form != null ? new FormConfig
            {
                Title = dto.Form.Title,
                Fields = dto.Form.Fields.Select(f => f.ToModel()).ToList()
            } : null,
            List = dto.List != null ? new ListConfig
            {
                DisplayFields = dto.List.DisplayFields,
                Columns = dto.List.Columns?.Select(c => new ListColumnConfig
                {
                    Key = c.Key,
                    Header = c.Header,
                    HeaderAr = c.HeaderAr,
                    Fields = c.Fields.Select(f => new ListColumnField
                    {
                        FieldKey = f.FieldKey,
                        RenderAs = f.RenderAs,
                        BadgeVariant = f.BadgeVariant
                    }).ToList()
                }).ToList() ?? new List<ListColumnConfig>(),
                EnableSearch = dto.List.EnableSearch,
                EnablePagination = dto.List.EnablePagination,
                PageSize = dto.List.PageSize,
                DefaultSortField = dto.List.DefaultSortField,
                DefaultSortDirection = dto.List.DefaultSortDirection
            } : null,
            ExportCollections = dto.ExportCollections.Select(e => new ExportCollection
            {
                CollectionName = e.CollectionName,
                Fields = e.Fields
            }).ToList(),
            Permissions = dto.Permissions != null ? new PagePermissions
            {
                ListAccess = dto.Permissions.ListAccess,
                CreateAccess = dto.Permissions.CreateAccess,
                EditAccess = dto.Permissions.EditAccess,
                DeleteAccess = dto.Permissions.DeleteAccess
            } : null
        };
    }

    private static PageConfigDto ToDto(this PageConfig model)
    {
        return new PageConfigDto(
            model.PageKey,
            model.Title,
            model.TitleAr,
            model.Form != null ? new FormConfigDto(
                model.Form.Title,
                model.Form.Fields.Select(f => f.ToDto()).ToList()
            ) : null,
            model.List != null ? new ListConfigDto(
                model.List.DisplayFields,
                model.List.Columns?.Count > 0 ? model.List.Columns.Select(c => new ListColumnConfigDto(
                    c.Key,
                    c.Header,
                    c.HeaderAr,
                    c.Fields.Select(f => new ListColumnFieldDto(f.FieldKey, f.RenderAs, f.BadgeVariant)).ToList()
                )).ToList() : null,
                model.List.EnableSearch,
                model.List.EnablePagination,
                model.List.PageSize,
                model.List.DefaultSortField,
                model.List.DefaultSortDirection
            ) : null,
            model.ExportCollections.Select(e => new ExportCollectionDto(e.CollectionName, e.Fields)).ToList(),
            model.Permissions != null ? new PagePermissionsDto(
                model.Permissions.ListAccess,
                model.Permissions.CreateAccess,
                model.Permissions.EditAccess,
                model.Permissions.DeleteAccess
            ) : null
        );
    }

    private static FieldConfig ToModel(this FieldConfigDto dto)
    {
        return new FieldConfig
        {
            FieldKey = dto.FieldKey,
            Label = dto.Label,
            LabelAr = dto.LabelAr,
            FieldType = dto.FieldType,
            DefaultValue = dto.DefaultValue,
            Placeholder = dto.Placeholder,
            Options = dto.Options?.Select(o => new FieldOption { Value = o.Value, Label = o.Label, LabelAr = o.LabelAr }).ToList(),
            AutocompleteConfig = dto.AutocompleteConfig != null ? new AutocompleteConfig
            {
                SourceType = dto.AutocompleteConfig.SourceType,
                CollectionRef = dto.AutocompleteConfig.CollectionRef,
                DisplayField = dto.AutocompleteConfig.DisplayField,
                ValueField = dto.AutocompleteConfig.ValueField,
                StaticOptions = dto.AutocompleteConfig.StaticOptions?.Select(o => new FieldOption { Value = o.Value, Label = o.Label, LabelAr = o.LabelAr }).ToList()
            } : null,
            SliderConfig = dto.SliderConfig != null ? new SliderConfig
            {
                Min = dto.SliderConfig.Min,
                Max = dto.SliderConfig.Max,
                Step = dto.SliderConfig.Step
            } : null,
            Validation = new FieldValidation
            {
                Required = dto.Validation.Required,
                MinLength = dto.Validation.MinLength,
                MaxLength = dto.Validation.MaxLength,
                Min = dto.Validation.Min,
                Max = dto.Validation.Max,
                Unique = dto.Validation.Unique,
                Regex = dto.Validation.Regex,
                RegexMessage = dto.Validation.RegexMessage,
                DisabledOnEdit = dto.Validation.DisabledOnEdit,
                CustomRules = dto.Validation.CustomRules?.Select(r => new CustomValidationRule
                {
                    RuleName = r.RuleName,
                    ErrorMessage = r.ErrorMessage,
                    Parameters = r.Parameters
                }).ToList()
            },
            Permission = dto.Permission != null ? new FieldPermission
            {
                ViewUsers = dto.Permission.ViewUsers,
                EditUsers = dto.Permission.EditUsers
            } : null,
            Order = dto.Order
        };
    }

    private static FieldConfigDto ToDto(this FieldConfig model)
    {
        return new FieldConfigDto(
            model.FieldKey,
            model.Label,
            model.LabelAr,
            model.FieldType,
            model.DefaultValue,
            model.Placeholder,
            model.Options?.Select(o => new FieldOptionDto(o.Value, o.Label, o.LabelAr)).ToList(),
            model.AutocompleteConfig != null ? new AutocompleteConfigDto(
                model.AutocompleteConfig.SourceType,
                model.AutocompleteConfig.CollectionRef,
                model.AutocompleteConfig.DisplayField,
                model.AutocompleteConfig.ValueField,
                model.AutocompleteConfig.StaticOptions?.Select(o => new FieldOptionDto(o.Value, o.Label, o.LabelAr)).ToList()
            ) : null,
            model.SliderConfig != null ? new SliderConfigDto(
                model.SliderConfig.Min,
                model.SliderConfig.Max,
                model.SliderConfig.Step
            ) : null,
            new FieldValidationDto(
                model.Validation.Required,
                model.Validation.MinLength,
                model.Validation.MaxLength,
                model.Validation.Min,
                model.Validation.Max,
                model.Validation.Unique,
                model.Validation.Regex,
                model.Validation.RegexMessage,
                model.Validation.DisabledOnEdit,
                model.Validation.CustomRules?.Select(r => new CustomValidationRuleDto(r.RuleName, r.ErrorMessage, r.Parameters)).ToList()
            ),
            model.Permission != null ? new FieldPermissionDto(
                model.Permission.ViewUsers,
                model.Permission.EditUsers
            ) : null,
            model.Order
        );
    }
}
