namespace DeadIt.Service.Grafana.Interface;

public interface IGrafanaService
{
    Task<bool> CreateDashboardAsync(CancellationToken cancellationToken = default);
    Task<bool> CreateContactPointAsync(CancellationToken cancellationToken = default);
    Task<bool> CreateAlertRulesAsync(CancellationToken cancellationToken = default);
}

