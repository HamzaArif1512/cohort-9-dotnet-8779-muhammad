using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Serilog;
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
            var builder = WebApplication.CreateBuilder(args);


            //Serilog configurations
            builder.Host.UseSerilog((context, services, configuration) =>
            {
                configuration
                    .ReadFrom.Configuration(context.Configuration)
                    .ReadFrom.Services(services)
                    .Enrich.FromLogContext();
            });

            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

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
            builder.Services.AddScoped<ICurrentUserService, ICurrentUserService>();

            //enpoints, controllers, swagger, and other services
            builder.Services
                .AddPresentation(builder.Configuration)
                .AddApplication()
                .AddInfrastructure(builder.Configuration);

            //health checks
            builder.Services.AddHealthChecks();

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();




            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }
            

            //swagger
            app.UseSwagger();
            app.UseSwaggerUI();

            //Register middleware extension method
            app.UseGlobalExceptionMiddleware(builder.Configuration);

            //Serilog request logging
            app.UseSerilogRequestLogging();

            app.UseHttpsRedirection();

            app.UseCors("Frontend");

            app.UseAuthentication();

            app.UseAuthorization();


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
            Log.Information("TaskManagement API started.");

            app.Run();
        }
    }
}
