using FluentValidation;
using TaskManagement.Application.DTOs.TaskDtos;

namespace TaskManagement.Application.Validators.TaskValidators;

public class CreateTaskDtoValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required.")
            .MaximumLength(100)
            .WithMessage("Title cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.Priority)
            .IsInEnum()
            .WithMessage("Invalid priority.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .WithMessage("A valid category must be selected.");

        RuleFor(x => x.AssigneeId)
            .GreaterThan(0)
            .WithMessage("A valid assignee must be selected.");

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Due date must be in the future.");
    }
}
