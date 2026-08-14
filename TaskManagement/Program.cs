using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog;
using TaskManagement.API.Extensions; //register middleware extension method
using TaskManagement.Application;
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
            Log.Information("TaskManagement API started.");

            app.Run();
        }
    }
}
