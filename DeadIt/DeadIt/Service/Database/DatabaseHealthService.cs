using DeadIt.Models;
using Microsoft.EntityFrameworkCore;
using Prometheus;

namespace DeadIt.Service.Database
{
    public class DatabaseHealthService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DatabaseHealthService> _logger;
        
        private static readonly Gauge DatabaseStatus = Metrics
            .CreateGauge("database_connection_status", "Database connection status (1 = UP, 0 = DOWN)", new[] { "database" });
        
        private static readonly Counter HealthCheckCounter = Metrics
            .CreateCounter("database_health_check_total", "Total number of database health checks performed", new[] { "database", "status" });

        public DatabaseHealthService(IServiceProvider serviceProvider, ILogger<DatabaseHealthService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DatabaseHealthService started");
            
            // Инициализируем метрику с начальным значением 0 (DOWN) - это гарантирует, что метрика будет экспортироваться
            var metricInstance = DatabaseStatus.WithLabels("DeadIt");
            metricInstance.Set(0);
            _logger.LogInformation("Database metric initialized with value 0");
            
            // Ждем немного перед первой проверкой, чтобы приложение полностью запустилось и БД была готова
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<DeadItDBContext>();
                    
                    _logger.LogInformation("Checking database connection...");
                    
                    // Пробуем несколько способов проверки подключения
                    bool canConnect = false;
                    string connectionInfo = "unknown";
                    
                    try
                    {
                        // Способ 1: Проверяем подключение к серверу через master базу
                        // Это работает даже если база DeadIt не существует
                        var connectionString = dbContext.Database.GetConnectionString();
                        if (!string.IsNullOrEmpty(connectionString))
                        {
                            // Создаем временную строку подключения к master
                            var masterConnectionString = connectionString
                                .Replace("Database=DeadIt", "Database=master")
                                .Replace("Database = DeadIt", "Database=master");
                            
                            // Создаем временный DbContext с подключением к master
                            var optionsBuilder = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<DeadItDBContext>();
                            optionsBuilder.UseSqlServer(masterConnectionString);
                            using var masterContext = new DeadItDBContext(optionsBuilder.Options);
                            
                            // Проверяем подключение к серверу через master
                            var serverAvailable = await masterContext.Database.CanConnectAsync(stoppingToken);
                            
                            if (serverAvailable)
                            {
                                _logger.LogInformation("SQL Server is accessible (connected to master database)");
                                
                                // Проверяем существование базы DeadIt
                                try
                                {
                                    var dbExistsResult = await masterContext.Database
                                        .ExecuteSqlRawAsync("SELECT COUNT(*) FROM sys.databases WHERE name = 'DeadIt'", stoppingToken);
                                    
                                    // Пробуем подключиться к DeadIt
                                    canConnect = await dbContext.Database.CanConnectAsync(stoppingToken);
                                    
                                    if (canConnect)
                                    {
                                        connectionInfo = "Server is UP, DeadIt database exists and is accessible";
                                    }
                                    else
                                    {
                                        connectionInfo = "Server is UP, but DeadIt database does not exist or is not accessible";
                                        // Сервер доступен, но база нет - устанавливаем 0
                                        canConnect = false;
                                    }
                                }
                                catch (Exception exDb)
                                {
                                    connectionInfo = $"Server is UP, but error checking DeadIt database: {exDb.Message}";
                                    canConnect = false;
                                    _logger.LogWarning(exDb, "Error checking DeadIt database existence");
                                }
                            }
                            else
                            {
                                connectionInfo = "Cannot connect to SQL Server";
                                canConnect = false;
                            }
                            
                            _logger.LogInformation(connectionInfo);
                        }
                        else
                        {
                            // Fallback: пробуем стандартный способ
                            canConnect = await dbContext.Database.CanConnectAsync(stoppingToken);
                            connectionInfo = $"CanConnectAsync returned: {canConnect}";
                            _logger.LogInformation(connectionInfo);
                        }
                    }
                    catch (Exception ex1)
                    {
                        _logger.LogWarning(ex1, "Connection check failed, trying alternative method");
                        
                        // Способ 2: Прямой запрос для получения детальной ошибки
                        try
                        {
                            await dbContext.Database.ExecuteSqlRawAsync("SELECT 1", stoppingToken);
                            canConnect = true;
                            connectionInfo = "ExecuteSqlRawAsync succeeded";
                            _logger.LogInformation(connectionInfo);
                        }
                        catch (Exception ex2)
                        {
                            canConnect = false;
                            connectionInfo = $"Connection failed. Error: {ex2.GetType().Name} - {ex2.Message}";
                            _logger.LogError(ex2, "ExecuteSqlRawAsync failed. Inner exception: {InnerException}", ex2.InnerException?.Message);
                        }
                    }
                    
                    var statusValue = canConnect ? 1.0 : 0.0;
                    metricInstance.Set(statusValue);
                    
                    // Увеличиваем счетчик проверок
                    HealthCheckCounter.WithLabels("DeadIt", canConnect ? "up" : "down").Inc();
                    
                    if (canConnect)
                    {
                        _logger.LogInformation("Database connection check: UP (status = {Status}). {Info}", statusValue, connectionInfo);
                    }
                    else
                    {
                        _logger.LogWarning("Database connection check: DOWN (status = {Status}). {Info}", statusValue, connectionInfo);
                    }
                }
                catch (Exception ex)
                {
                    metricInstance.Set(0);
                    HealthCheckCounter.WithLabels("DeadIt", "error").Inc();
                    _logger.LogError(ex, "Error checking database connection, setting status to 0. Exception type: {ExceptionType}, Message: {Message}, StackTrace: {StackTrace}", 
                        ex.GetType().Name, ex.Message, ex.StackTrace);
                }

                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }

            _logger.LogInformation("DatabaseHealthService stopped");
        }
    }
}
