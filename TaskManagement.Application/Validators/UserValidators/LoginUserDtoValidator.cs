using FluentValidation;
using TaskManagement.Application.DTOs.AuthDtos;
using TaskManagement.Application.DTOs.UserDtos;

namespace TaskManagement.Application.Validators.UserValidators;

public class LoginUserDtoValidator : AbstractValidator<LoginUserDto>
{
    public LoginUserDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty();
    }
}
