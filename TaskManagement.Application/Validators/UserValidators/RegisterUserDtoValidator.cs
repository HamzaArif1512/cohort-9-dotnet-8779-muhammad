using FluentValidation;
using TaskManagement.Application.DTOs.UserDtos;
using TaskManagement.Application.Validators.UserValidators;

namespace TaskManagement.Application.Validators.UserValidators;

public class RegisterUserDtoValidator : AbstractValidator<RegisterUserDto>
{
    public RegisterUserDtoValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.").Matches("[0-9]").WithMessage("Password must contain at least one digit.").MaximumLength(100);
        RuleFor(x => x.ConfirmPassword).NotEmpty().Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}
