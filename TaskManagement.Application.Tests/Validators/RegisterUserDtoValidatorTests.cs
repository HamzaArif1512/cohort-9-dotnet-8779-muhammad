using FluentValidation.TestHelper;
using TaskManagement.Application.DTOs.UserDtos;
using TaskManagement.Application.Validators.UserValidators;

namespace TaskManagement.Application.Tests.Validators;

public class RegisterUserDtoValidatorTests
{
    private readonly RegisterUserDtoValidator _validator = new();

    [Fact]
    public void ValidRegistration_ShouldPassValidation()
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            FullName = "ValidUser",
            Email = "test@example.com",
            Password = "ValidPassword123!",
            ConfirmPassword = "ValidPassword123!"
        };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void PasswordWithoutUppercase_ShouldFailValidation()
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            FullName = "ValidUser",
            Email = "test@example.com",
            Password = "invalidpassword123!",
            ConfirmPassword = "invalidpassword123!"
        };

        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must contain at least one uppercase letter.");
    }

    [Fact]
    public void PasswordWithoutNumber_ShouldFailValidation()
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            FullName = "ValidUser",
            Email = "test@example.com",
            Password = "InvalidPassword!",
            ConfirmPassword = "InvalidPassword!"
        };

        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void PasswordTooShort_ShouldFailValidation()
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            FullName = "ValidUser",
            Email = "test@example.com",
            Password = "Short1!",
            ConfirmPassword = "Short1!"

        };

        var result = _validator.TestValidate(dto);
        result
            .ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage(
                "The length of 'Password' must be at least 8 characters. You entered 7 characters.");
    }

    [Fact]
    public void MismatchedPasswords_ShouldFailValidation()
    {
        // Arrange
        var dto = new RegisterUserDto
        {
            FullName = "ValidUser",
            Email = "test@example.com",
            Password = "ValidPassword123!",
            ConfirmPassword = "DifferentPassword123!"
        };

        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.ConfirmPassword)
            .WithErrorMessage("Passwords do not match.");
    }
}
