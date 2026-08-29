using FluentValidation;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Validators.TaskValidators;

public class UpdateTaskDtoValidator : AbstractValidator<UpdateTaskDto>
{
    public UpdateTaskDtoValidator()
    {


        var today = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(
        DateTime.UtcNow,
        "Pakistan Standard Time").Date;

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(1000);

        RuleFor(x => x.Priority)
            .NotEmpty()
            .IsInEnum()
            .WithMessage("Invalid priority.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .IsInEnum()
            .WithMessage("Invalid status.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0);

        RuleFor(x => x.AssigneeId)
            .NotEmpty();

        RuleFor(x => x.DueDate)
            .Must(dueDate => !dueDate.HasValue || dueDate.Value.Date >= today)
            .WithMessage("'Due Date' cannot be earlier than today.");
    }
}
