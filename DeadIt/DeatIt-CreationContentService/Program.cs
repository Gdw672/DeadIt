using DeatIt_CreationContentService.Models.DB__Context;
using DeatIt_CreationContentService.Service.Database;
using DeatIt_CreationContentService.Service.Database.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Scaffolding.Metadata;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);
var Origins = "dead-it-content-creation-react-app";

builder.Services.AddTransient<IContentCreationDBContext, ContentCreationDBContext>();
builder.Services.AddTransient<IDatabaseInserterService, DatabaseInserterService>();


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
    options.AddPolicy(Origins, policy =>
    {
        policy.WithOrigins("https://localhost:5181/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3000/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3003/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3004/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3005/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();

    }));

builder.Services.AddDbContext<ContentCreationDBContext>(options =>
    options.UseSqlServer(
        "Server=localhost,1434; Database=DeadItContentCreation; User Id=sa; Password=Lord3009!; TrustServerCertificate=True;",
        sqlOptions => sqlOptions.EnableRetryOnFailure()));

// OpenTelemetry tracing with Zipkin exporter
builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
    {
        tracerProviderBuilder
            .SetResourceBuilder(
                ResourceBuilder.CreateDefault()
                    .AddService("DeadIt-ContentCreation"))
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddZipkinExporter(options =>
            {
                options.Endpoint = new Uri("http://zipkin:9411/api/v2/spans");
            });
    });

var app = builder.Build();

app.UseHttpsRedirection();
app.UseRouting();

// Prometheus metrics - must be after UseRouting() to capture route information
app.UseHttpMetrics();

app.UseCors(Origins);
app.UseAuthorization();

app.MapControllers();

// Prometheus metrics endpoint
app.UseMetricServer();

app.Run();
