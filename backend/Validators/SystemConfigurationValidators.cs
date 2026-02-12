using Backend.DTOs;
using FluentValidation;

namespace Backend.Validators;

public class CreateSystemConfigurationValidator : AbstractValidator<CreateSystemConfigurationDto>
{
    public CreateSystemConfigurationValidator()
    {
        RuleFor(x => x.SystemKey)
            .NotEmpty().WithMessage("System key is required")
            .MaximumLength(100).WithMessage("System key must not exceed 100 characters")
            .Matches("^[a-zA-Z0-9_-]+$").WithMessage("System key can only contain letters, numbers, hyphens and underscores");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("Created by is required");

        RuleFor(x => x.Configuration)
            .NotNull().WithMessage("Configuration is required")
            .SetValidator(new SystemConfigDataValidator());
    }
}

public class UpdateSystemConfigurationValidator : AbstractValidator<UpdateSystemConfigurationDto>
{
    public UpdateSystemConfigurationValidator()
    {
        RuleFor(x => x.UpdatedBy)
            .NotEmpty().WithMessage("Updated by is required");

        RuleFor(x => x.Configuration)
            .NotNull().WithMessage("Configuration is required")
            .SetValidator(new SystemConfigDataValidator());
    }
}

public class SystemConfigDataValidator : AbstractValidator<SystemConfigDataDto>
{
    public SystemConfigDataValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200);

        RuleFor(x => x.TitleAr)
            .NotEmpty().WithMessage("Arabic title is required")
            .MaximumLength(200);

        RuleForEach(x => x.Pages).SetValidator(new PageConfigValidator());
    }
}

public class PageConfigValidator : AbstractValidator<PageConfigDto>
{
    public PageConfigValidator()
    {
        RuleFor(x => x.PageKey)
            .NotEmpty().WithMessage("Page key is required")
            .Matches("^[a-zA-Z0-9_-]+$");

        RuleFor(x => x.Title).NotEmpty();
        RuleFor(x => x.TitleAr).NotEmpty();

        When(x => x.Form != null, () =>
        {
            RuleFor(x => x.Form!).SetValidator(new FormConfigValidator());
        });
    }
}

public class FormConfigValidator : AbstractValidator<FormConfigDto>
{
    public FormConfigValidator()
    {
        RuleFor(x => x.Title).NotEmpty();
        RuleForEach(x => x.Fields).SetValidator(new FieldConfigValidator());
    }
}

public class FieldConfigValidator : AbstractValidator<FieldConfigDto>
{
    private static readonly string[] ValidFieldTypes = {
        "Text", "Password", "Number", "Date", "DateTime", "TextArea",
        "Slider", "Radio", "Checkbox", "MultiSelect",
        "Autocomplete", "MultiSelectAutocomplete"
    };

    public FieldConfigValidator()
    {
        RuleFor(x => x.FieldKey)
            .NotEmpty().WithMessage("Field key is required")
            .Matches("^[a-zA-Z0-9_-]+$");

        RuleFor(x => x.Label).NotEmpty();

        RuleFor(x => x.FieldType)
            .NotEmpty()
            .Must(ft => ValidFieldTypes.Contains(ft))
            .WithMessage($"Field type must be one of: {string.Join(", ", ValidFieldTypes)}");

        When(x => x.FieldType == "Slider" && x.SliderConfig != null, () =>
        {
            RuleFor(x => x.SliderConfig!.Min).LessThan(x => x.SliderConfig!.Max)
                .WithMessage("Slider min must be less than max");
            RuleFor(x => x.SliderConfig!.Step).GreaterThan(0);
        });

        When(x => x.FieldType == "Autocomplete" || x.FieldType == "MultiSelectAutocomplete", () =>
        {
            RuleFor(x => x.AutocompleteConfig)
                .NotNull().WithMessage("Autocomplete config is required for autocomplete field types");
        });
    }
}
