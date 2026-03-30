using System.Net.Http.Headers;
using System.Text;
using DeadIt.Models;
using DeadIt.Service.Database;
using DeadIt.Service.Database.Interface;
using DeadIt.Service.Database.Main;
using DeadIt.Service.Grafana;
using DeadIt.Service.Grafana.Interface;
using DeadIt.Service.Images;
using DeadIt.Service.Images.Interface;
using DeadIt.Service.Session;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);
var Origins = "dead-it-react-app";

builder.Services.AddControllersWithViews();

SetupTransient();

builder.Services.AddHttpContextAccessor();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();

builder.Services.AddCors(options =>
    options.AddPolicy(Origins, policy =>
    {
        policy.WithOrigins("https://localhost:7252/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3000/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3001/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
    }));

builder.Services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

builder.Services.AddDbContext<DeadItDBContext>(options =>
options.UseSqlServer("Server=mssql,1433; Database=DeadIt; User Id=sa; Password=Lord3009!; TrustServerCertificate=True;"));

// OpenTelemetry tracing with Zipkin exporter
builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
    {
        tracerProviderBuilder
            .SetResourceBuilder(
                ResourceBuilder.CreateDefault()
                    .AddService("DeadIt"))
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddZipkinExporter(options =>
            {
                options.Endpoint = new Uri("http://zipkin:9411/api/v2/spans");
            });
    });

// Регистрация Grafana сервиса
builder.Services.AddHttpClient<IGrafanaService, GrafanaService>();

var app = builder.Build();

    options.UseSqlServer("Server=mssql,1433; Database=DeadIt; User Id=sa; Password=Lord3009!; TrustServerCertificate=True;"));
var app = builder.Build();
options.UseSqlServer(
  "Server=localhost,1434;Database=DeadIt;User Id=sa;Password=Lord3009!;TrustServerCertificate=True;"
));
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

SetupStaticFiles();

app.UseSession();
app.UseRouting();

// Prometheus metrics - must be after UseRouting() to capture route information
app.UseHttpMetrics();

app.UseCors(Origins);
app.UseAuthorization();

// Prometheus metrics endpoint
app.UseMetricServer();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Main}/{action=MainTitle}/{id?}");

// Создание дашборда Grafana при запуске приложения
_ = Task.Run(async () =>
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    var configuration = app.Services.GetRequiredService<IConfiguration>();
    var grafanaUrl = configuration["Grafana:Url"] ?? "http://grafana:3000";
    
    try
    {
        // Ждем готовности Grafana с повторными попытками
        logger.LogInformation("Waiting for Grafana to be ready...");
        const int maxRetries = 30;
        const int delaySeconds = 2;
        bool grafanaReady = false;
        
        using var httpClient = new HttpClient();
        var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes(
            $"{configuration["Grafana:User"] ?? "admin"}:{configuration["Grafana:Password"] ?? "admin"}"));
        httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Basic", authValue);
        
        for (int i = 0; i < maxRetries; i++)
        {
            try
            {
                var response = await httpClient.GetAsync($"{grafanaUrl}/api/health", cancellationToken: default);
                if (response.IsSuccessStatusCode)
                {
                    grafanaReady = true;
                    logger.LogInformation("Grafana is ready!");
                    break;
                }
            }
            catch
            {
                // Игнорируем ошибки при проверке
            }
            
            if (i < maxRetries - 1)
            {
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }
        
        if (!grafanaReady)
        {
            logger.LogWarning("Grafana did not become ready in time. Will still attempt to create dashboard.");
        }
        
        // Дополнительная небольшая задержка для полной инициализации
        await Task.Delay(TimeSpan.FromSeconds(2));
        
        logger.LogInformation("Attempting to create Grafana dashboard...");
        
        var grafanaService = app.Services.GetRequiredService<IGrafanaService>();
        
        // Создаем дашборд
        var dashboardSuccess = await grafanaService.CreateDashboardAsync();
        if (dashboardSuccess)
        {
            logger.LogInformation("Grafana dashboard created/updated successfully");
        }
        else
        {
            logger.LogWarning("Failed to create/update Grafana dashboard. This is not critical and the application will continue to run.");
        }
        
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error creating Grafana dashboard. This is not critical and the application will continue to run.");
    }
});

app.Run();

void SetupTransient()
{
    builder.Services.AddTransient<IDeadItDBContext, DeadItDBContext>();
    builder.Services.AddTransient<ISessionService, SessionService>();

    builder.Services.AddTransient<IDataBaseService, DataBaseService>();
    builder.Services.AddTransient<IDatabaseChoiceService, DatabaseChoiceService>();
    builder.Services.AddTransient<IDatabaseNoChoiceService, DatabaseNoChoiceService>();
    builder.Services.AddScoped<IBackgroundService, DeadIt.Service.Images.BackgroundService>();
    
    // Регистрация BackgroundService для проверки состояния БД
    builder.Services.AddHostedService<DatabaseHealthService>();
}

//ToDo: разобраться с путем к проекту, чтобы не указывать путь целиком.
void SetupStaticFiles()
{
    app.UseStaticFiles();
}