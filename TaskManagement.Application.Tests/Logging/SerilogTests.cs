using FluentAssertions;
using Serilog;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using Xunit;

namespace TaskManagement.Application.Tests.Logging;

public class SerilogTests
{
    [Fact]
    public void InformationLog_ShouldBeWrittenToFile()
    {
        // Arrange
        var logDirectory = CreateTempDirectory();
        var logFilePath = Path.Combine(logDirectory, "test-log.txt");

        const string message = "Test Serilog message.";

        // Act
        using (var logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .WriteTo.File(
                logFilePath,
                outputTemplate:
                    "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
            .CreateLogger())
        {
            logger.Information(message);
        }

        // Assert
        File.Exists(logFilePath).Should().BeTrue();

        var logContent = File.ReadAllText(logFilePath);

        logContent.Should().Contain(message);
        logContent.Should().Contain("INF");

        Directory.Delete(logDirectory, recursive: true);
    }

    [Fact]
    public void ErrorLog_ShouldContainExceptionInformation()
    {
        // Arrange
        var logDirectory = CreateTempDirectory();
        var logFilePath = Path.Combine(logDirectory, "test-log.txt");

        var exception = new InvalidOperationException(
            "Test exception.");

        // Act
        using (var logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .WriteTo.File(
                logFilePath,
                outputTemplate:
                    "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
            .CreateLogger())
        {
            logger.Error(
                exception,
                "An error occurred.");
        }

        // Assert
        var logContent = File.ReadAllText(logFilePath);

        logContent.Should().Contain("ERR");
        logContent.Should().Contain("An error occurred.");
        logContent.Should().Contain("Test exception.");
        logContent.Should().Contain("InvalidOperationException");

        Directory.Delete(logDirectory, recursive: true);
    }

    [Fact]
    public void LogFile_ShouldUseExpectedFormat()
    {
        // Arrange
        var logDirectory = CreateTempDirectory();
        var logFilePath = Path.Combine(logDirectory, "test-log.txt");

        // Act
        using (var logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .WriteTo.File(
                logFilePath,
                outputTemplate:
                    "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
            .CreateLogger())
        {
            logger.Information("Format test");
        }

        // Assert
        var logContent = File.ReadAllText(logFilePath);

        logContent.Should().Contain("INF");
        logContent.Should().Contain("Format test");

        Directory.Delete(logDirectory, recursive: true);
    }

    private static string CreateTempDirectory()
    {
        var directory = Path.Combine(
            Path.GetTempPath(),
            $"TaskManagementTests_{Guid.NewGuid()}");

        Directory.CreateDirectory(directory);

        return directory;
    }


}
