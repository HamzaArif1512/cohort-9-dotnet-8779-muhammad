using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AutoMapper;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using TaskManagement.API;
using TaskManagement.API.Extensions; //register middleware extension method
using TaskManagement.Application;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Validators.UserValidators;
using TaskManagement.Infrastructure;
using TaskManagement.Infrastructure.Configurations;



namespace TaskManagement
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("========== PROGRAM STARTED ==========");
            var builder = WebApplication.CreateBuilder(args);


            //Serilog configurations
            builder.Host.UseSerilog((context, services, configuration) =>
            {
                configuration
                    .ReadFrom.Configuration(context.Configuration)
                    .ReadFrom.Services(services)
                    .Enrich.FromLogContext();
            });

            builder.Services
            .AddOptions<JwtSettings>()
            .Bind(builder.Configuration.GetSection("Jwt"))
            .Validate(settings =>
                !string.IsNullOrWhiteSpace(settings.Key),
                "JWT Key is required.")
            .Validate(settings =>
                !string.IsNullOrWhiteSpace(settings.Issuer),
                "JWT Issuer is required.")
            .Validate(settings =>
                !string.IsNullOrWhiteSpace(settings.Audience),
                "JWT Audience is required.")
            .Validate(settings =>
                settings.AccessTokenExpirationMinutes > 0,
                "JWT access token expiration must be greater than 0 minutes.")
            .Validate(settings =>
                settings.RefreshTokenExpirationDays > 0,
                "JWT refresh token expiration must be greater than 0 days.")
            .Validate(settings =>
                System.Text.Encoding.UTF8.GetByteCount(settings.Key) >= 32,
                "JWT Key must be at least 32 UTF-8 bytes long.")
            .ValidateOnStart();

            var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? throw new InvalidOperationException("JWT settings are not configured properly.");

            //Authentication scheme
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings.Issuer,
                        ValidAudience = jwtSettings.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
                        ClockSkew = TimeSpan.Zero
                    };
                });

            //Authorization
            builder.Services.AddAuthorization();

            //Register Validation
            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

            builder.Services.AddFluentValidationAutoValidation();
            builder.Services.AddValidatorsFromAssemblyContaining<RegisterUserDtoValidator>();

            //Task Management
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

            //enpoints, controllers, swagger, and other services
            builder.Services
                .AddPresentation(builder.Configuration)
                .AddApplication()
                .AddInfrastructure(builder.Configuration);

            //health checks
            builder.Services.AddHealthChecks();

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();



            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                {
                    policy
                        .WithOrigins("http://localhost:8443")
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });



            var app = builder.Build();


            //using (var scope = app.Services.CreateScope())
            //{
            //    var mapper = scope.ServiceProvider.GetRequiredService<IMapper>();
            //    mapper.ConfigurationProvider.AssertConfigurationIsValid();
            //}

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.MapOpenApi();
            }



            //Register middleware extension method
            app.UseGlobalExceptionMiddleware(builder.Configuration);

            //Serilog request logging
            app.UseSerilogRequestLogging();

            app.UseHttpsRedirection();

            app.UseCors("Frontend");

            app.UseAuthentication();

            app.UseAuthorization();




            app.MapControllers();

            //Health check endpoint
            app.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = async (context, report) =>
                {
                    context.Response.ContentType = "application/json";

                    var response = new
                    {
                        Status = report.Status.ToString(),
                        TotalDuration = report.TotalDuration,
                        Checks = report.Entries.Select(entry => new
                        {
                            Name = entry.Key,
                            Status = entry.Value.Status.ToString(),
                            Duration = entry.Value.Duration
                        })
                    };

                    await context.Response.WriteAsync(
                        JsonSerializer.Serialize(response));
                }
            });

            //Confrmation message to indicate that the application is running
            Console.WriteLine("========== BEFORE LOG ==========");

            Log.Information("TaskManagement API started.");

            Console.WriteLine("========== AFTER LOG ==========");

            foreach (var address in app.Urls)
            {
                Console.WriteLine($"API listening on: {address}");
            }

            Console.WriteLine("========== BEFORE APP.RUN ==========");

            app.Run();

            Console.WriteLine("========== AFTER APP.RUN ==========");
        }
    }
}
