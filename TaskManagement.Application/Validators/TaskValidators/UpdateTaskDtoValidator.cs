using FluentValidation;
using TaskManagement.Application.DTOs.TaskDtos;

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
            .IsInEnum();

        RuleFor(x => x.Status)
            .IsInEnum();

        RuleFor(x => x.CategoryId)
            .GreaterThan(0);

        RuleFor(x => x.AssigneeId)
            .GreaterThan(0);

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow);
    }
}
