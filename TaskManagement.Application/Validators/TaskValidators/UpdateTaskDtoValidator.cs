using FluentValidation;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Validators.TaskValidators;

public class UpdateTaskDtoValidator : AbstractValidator<UpdateTaskDto>
{
    public UpdateTaskDtoValidator()
    {
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
            .GreaterThan(DateTime.UtcNow);
    }
}
