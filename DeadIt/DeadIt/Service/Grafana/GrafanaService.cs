using System.Linq;
using System.Text;
using System.Text.Json;
using DeadIt.Service.Grafana.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DeadIt.Service.Grafana;

public class GrafanaService : IGrafanaService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GrafanaService> _logger;
    private readonly string _grafanaUrl;
    private readonly string _grafanaUser;
    private readonly string _grafanaPassword;
    private readonly string _dashboardUid;

    public GrafanaService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GrafanaService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        
        _grafanaUrl = _configuration["Grafana:Url"] ?? "http://grafana:3000";
        _grafanaUser = _configuration["Grafana:User"] ?? "admin";
        _grafanaPassword = _configuration["Grafana:Password"] ?? "admin";
        _dashboardUid = _configuration["Grafana:DashboardUid"] ?? "addmfp6";

        var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_grafanaUser}:{_grafanaPassword}"));
        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authValue);
        _httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<bool> CreateDashboardAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            // Читаем JSON дашборда из встроенного ресурса или используем переданный
            var dashboardJson = GetDashboardJson();

            // Проверяем, существует ли дашборд
            var existingDashboard = await GetDashboardByUidAsync(_dashboardUid, cancellationToken);
            
            if (existingDashboard != null)
            {
                _logger.LogInformation("Dashboard with UID {Uid} already exists. Updating...", _dashboardUid);
                
                // Обновляем существующий дашборд
                var updateRequest = new
                {
                    dashboard = JsonSerializer.Deserialize<JsonElement>(dashboardJson),
                    overwrite = true
                };

                var updateJson = JsonSerializer.Serialize(updateRequest);
                var updateContent = new StringContent(updateJson, Encoding.UTF8, "application/json");
                var updateResponse = await _httpClient.PostAsync($"{_grafanaUrl}/api/dashboards/db", updateContent, cancellationToken);

                if (updateResponse.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Dashboard updated successfully");
                    return true;
                }
                else
                {
                    var errorContent = await updateResponse.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("Failed to update dashboard. Status: {Status}, Response: {Response}", 
                        updateResponse.StatusCode, errorContent);
                    return false;
                }
            }
            else
            {
                _logger.LogInformation("Creating new dashboard with UID {Uid}...", _dashboardUid);
                
                // Создаем новый дашборд
                var createRequest = new
                {
                    dashboard = JsonSerializer.Deserialize<JsonElement>(dashboardJson),
                    overwrite = false
                };

                var createJson = JsonSerializer.Serialize(createRequest);
                var createContent = new StringContent(createJson, Encoding.UTF8, "application/json");
                var createResponse = await _httpClient.PostAsync($"{_grafanaUrl}/api/dashboards/db", createContent, cancellationToken);

                if (createResponse.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Dashboard created successfully");
                    return true;
                }
                else
                {
                    var errorContent = await createResponse.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("Failed to create dashboard. Status: {Status}, Response: {Response}", 
                        createResponse.StatusCode, errorContent);
                    return false;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating dashboard");
            return false;
        }
    }

    private async Task<JsonElement?> GetDashboardByUidAsync(string uid, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_grafanaUrl}/api/dashboards/uid/{uid}", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var jsonDoc = JsonDocument.Parse(content);
                if (jsonDoc.RootElement.TryGetProperty("dashboard", out var dashboard))
                {
                    return dashboard;
                }
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error checking for existing dashboard");
            return null;
        }
    }

    private string GetDashboardJson()
    {
        return @"{
  ""annotations"": {
    ""list"": [
      {
        ""builtIn"": 1,
        ""datasource"": {
          ""type"": ""grafana"",
          ""uid"": ""-- Grafana --""
        },
        ""enable"": true,
        ""hide"": true,
        ""iconColor"": ""rgba(0, 211, 255, 1)"",
        ""name"": ""Annotations & Alerts"",
        ""type"": ""dashboard""
      }
    ]
  },
  ""editable"": true,
  ""fiscalYearStartMonth"": 0,
  ""graphTooltip"": 0,
  ""id"": null,
  ""links"": [],
  ""panels"": [
    {
      ""datasource"": {
        ""type"": ""prometheus"",
        ""uid"": ""PBFA97CFB590B2093""
      },
      ""fieldConfig"": {
        ""defaults"": {
          ""color"": {
            ""mode"": ""palette-classic""
          },
          ""custom"": {
            ""axisBorderShow"": false,
            ""axisCenteredZero"": false,
            ""axisColorMode"": ""text"",
            ""axisLabel"": """",
            ""axisPlacement"": ""auto"",
            ""barAlignment"": 0,
            ""barWidthFactor"": 0.6,
            ""drawStyle"": ""line"",
            ""fillOpacity"": 0,
            ""gradientMode"": ""none"",
            ""hideFrom"": {
              ""legend"": false,
              ""tooltip"": false,
              ""viz"": false
            },
            ""insertNulls"": false,
            ""lineInterpolation"": ""linear"",
            ""lineWidth"": 1,
            ""pointSize"": 5,
            ""scaleDistribution"": {
              ""type"": ""linear""
            },
            ""showPoints"": ""auto"",
            ""showValues"": false,
            ""spanNulls"": false,
            ""stacking"": {
              ""group"": ""A"",
              ""mode"": ""none""
            },
            ""thresholdsStyle"": {
              ""mode"": ""off""
            }
          },
          ""mappings"": [],
          ""thresholds"": {
            ""mode"": ""absolute"",
            ""steps"": [
              {
                ""color"": ""green"",
                ""value"": 0
              },
              {
                ""color"": ""red"",
                ""value"": 80
              }
            ]
          },
          ""unit"": ""bytes""
        },
        ""overrides"": []
      },
      ""gridPos"": {
        ""h"": 8,
        ""w"": 12,
        ""x"": 0,
        ""y"": 0
      },
      ""id"": 1,
      ""options"": {
        ""legend"": {
          ""calcs"": [],
          ""displayMode"": ""list"",
          ""placement"": ""bottom"",
          ""showLegend"": true
        },
        ""tooltip"": {
          ""hideZeros"": false,
          ""mode"": ""single"",
          ""sort"": ""none""
        }
      },
      ""pluginVersion"": ""12.3.0"",
      ""targets"": [
        {
          ""datasource"": {
            ""type"": ""prometheus"",
            ""uid"": ""PBFA97CFB590B2093""
          },
          ""editorMode"": ""code"",
          ""expr"": ""dotnet_total_memory_bytes"",
          ""interval"": """",
          ""legendFormat"": ""{{job}}"",
          ""range"": true,
          ""refId"": ""A""
        }
      ],
      ""title"": ""Использование ОЗУ"",
      ""type"": ""timeseries""
    },
    {
      ""datasource"": {
        ""type"": ""prometheus"",
        ""uid"": ""PBFA97CFB590B2093""
      },
      ""fieldConfig"": {
        ""defaults"": {
          ""color"": {
            ""mode"": ""palette-classic""
          },
          ""custom"": {
            ""axisBorderShow"": false,
            ""axisCenteredZero"": false,
            ""axisColorMode"": ""text"",
            ""axisLabel"": """",
            ""axisPlacement"": ""auto"",
            ""barAlignment"": 0,
            ""barWidthFactor"": 0.6,
            ""drawStyle"": ""line"",
            ""fillOpacity"": 0,
            ""gradientMode"": ""none"",
            ""hideFrom"": {
              ""legend"": false,
              ""tooltip"": false,
              ""viz"": false
            },
            ""insertNulls"": false,
            ""lineInterpolation"": ""linear"",
            ""lineWidth"": 1,
            ""pointSize"": 5,
            ""scaleDistribution"": {
              ""type"": ""linear""
            },
            ""showPoints"": ""auto"",
            ""showValues"": false,
            ""spanNulls"": false,
            ""stacking"": {
              ""group"": ""A"",
              ""mode"": ""none""
            },
            ""thresholdsStyle"": {
              ""mode"": ""off""
            }
          },
          ""mappings"": [],
          ""thresholds"": {
            ""mode"": ""absolute"",
            ""steps"": [
              {
                ""color"": ""green"",
                ""value"": 0
              },
              {
                ""color"": ""red"",
                ""value"": 80
              }
            ]
          }
        },
        ""overrides"": []
      },
      ""gridPos"": {
        ""h"": 8,
        ""w"": 12,
        ""x"": 12,
        ""y"": 0
      },
      ""id"": 4,
      ""options"": {
        ""legend"": {
          ""calcs"": [],
          ""displayMode"": ""list"",
          ""placement"": ""bottom"",
          ""showLegend"": true
        },
        ""tooltip"": {
          ""hideZeros"": false,
          ""mode"": ""single"",
          ""sort"": ""none""
        }
      },
      ""pluginVersion"": ""12.3.0"",
      ""targets"": [
        {
          ""editorMode"": ""builder"",
          ""expr"": ""process_num_threads"",
          ""legendFormat"": ""{{job}}"",
          ""range"": true,
          ""refId"": ""A""
        }
      ],
      ""title"": ""Threads"",
      ""type"": ""timeseries""
    },
    {
      ""datasource"": {
        ""type"": ""prometheus"",
        ""uid"": ""PBFA97CFB590B2093""
      },
      ""fieldConfig"": {
        ""defaults"": {
          ""color"": {
            ""mode"": ""palette-classic""
          },
          ""custom"": {
            ""axisBorderShow"": false,
            ""axisCenteredZero"": false,
            ""axisColorMode"": ""text"",
            ""axisLabel"": """",
            ""axisPlacement"": ""auto"",
            ""barAlignment"": 0,
            ""barWidthFactor"": 0.6,
            ""drawStyle"": ""line"",
            ""fillOpacity"": 0,
            ""gradientMode"": ""none"",
            ""hideFrom"": {
              ""legend"": false,
              ""tooltip"": false,
              ""viz"": false
            },
            ""insertNulls"": false,
            ""lineInterpolation"": ""linear"",
            ""lineWidth"": 1,
            ""pointSize"": 5,
            ""scaleDistribution"": {
              ""type"": ""linear""
            },
            ""showPoints"": ""auto"",
            ""showValues"": false,
            ""spanNulls"": false,
            ""stacking"": {
              ""group"": ""A"",
              ""mode"": ""none""
            },
            ""thresholdsStyle"": {
              ""mode"": ""off""
            }
          },
          ""mappings"": [],
          ""thresholds"": {
            ""mode"": ""absolute"",
            ""steps"": [
              {
                ""color"": ""green"",
                ""value"": 0
              },
              {
                ""color"": ""red"",
                ""value"": 80
              }
            ]
          },
          ""unit"": ""calls/min""
        },
        ""overrides"": []
      },
      ""gridPos"": {
        ""h"": 8,
        ""w"": 12,
        ""x"": 0,
        ""y"": 8
      },
      ""id"": 2,
      ""options"": {
        ""legend"": {
          ""calcs"": [],
          ""displayMode"": ""list"",
          ""placement"": ""bottom"",
          ""showLegend"": true
        },
        ""tooltip"": {
          ""hideZeros"": false,
          ""mode"": ""single"",
          ""sort"": ""none""
        }
      },
      ""pluginVersion"": ""12.3.0"",
      ""targets"": [
        {
          ""editorMode"": ""code"",
          ""expr"": ""sum(rate(dotnet_collection_count_total[5m])) by (generation) * 60"",
          ""legendFormat"": ""Generation {{generation}}"",
          ""range"": true,
          ""refId"": ""A""
        }
      ],
      ""title"": ""Очистка GC"",
      ""type"": ""timeseries""
    },
    {
      ""datasource"": {
        ""type"": ""prometheus"",
        ""uid"": ""PBFA97CFB590B2093""
      },
      ""fieldConfig"": {
        ""defaults"": {
          ""color"": {
            ""mode"": ""thresholds""
          },
          ""mappings"": [],
          ""thresholds"": {
            ""mode"": ""absolute"",
            ""steps"": [
              {
                ""color"": ""green"",
                ""value"": 0
              },
              {
                ""color"": ""red"",
                ""value"": 80
              }
            ]
          }
        },
        ""overrides"": []
      },
      ""gridPos"": {
        ""h"": 8,
        ""w"": 12,
        ""x"": 12,
        ""y"": 8
      },
      ""id"": 5,
      ""options"": {
        ""colorMode"": ""value"",
        ""graphMode"": ""area"",
        ""justifyMode"": ""auto"",
        ""orientation"": ""auto"",
        ""percentChangeColorMode"": ""standard"",
        ""reduceOptions"": {
          ""calcs"": [
            ""lastNotNull""
          ],
          ""fields"": """",
          ""values"": false
        },
        ""showPercentChange"": false,
        ""textMode"": ""auto"",
        ""wideLayout"": true
      },
      ""pluginVersion"": ""12.3.0"",
      ""targets"": [
        {
          ""editorMode"": ""code"",
          ""expr"": ""sum(dotnet_collection_count_total) by (generation)"",
          ""legendFormat"": ""Generation {{generation}}"",
          ""range"": true,
          ""refId"": ""A""
        }
      ],
      ""title"": ""запуски Garbage Collect"",
      ""type"": ""stat""
    },
    {
      ""datasource"": {
        ""type"": ""prometheus"",
        ""uid"": ""PBFA97CFB590B2093""
      },
      ""fieldConfig"": {
        ""defaults"": {
          ""color"": {
            ""mode"": ""palette-classic""
          },
          ""custom"": {
            ""axisBorderShow"": false,
            ""axisCenteredZero"": false,
            ""axisColorMode"": ""text"",
            ""axisLabel"": """",
            ""axisPlacement"": ""auto"",
            ""barAlignment"": 0,
            ""barWidthFactor"": 0.6,
            ""drawStyle"": ""line"",
            ""fillOpacity"": 0,
            ""gradientMode"": ""none"",
            ""hideFrom"": {
              ""legend"": false,
              ""tooltip"": false,
              ""viz"": false
            },
            ""insertNulls"": false,
            ""lineInterpolation"": ""linear"",
            ""lineWidth"": 1,
            ""pointSize"": 5,
            ""scaleDistribution"": {
              ""type"": ""linear""
            },
            ""showPoints"": ""auto"",
            ""showValues"": false,
            ""spanNulls"": false,
            ""stacking"": {
              ""group"": ""A"",
              ""mode"": ""none""
            },
            ""thresholdsStyle"": {
              ""mode"": ""off""
            }
          },
          ""decimals"": 0,
          ""fieldMinMax"": false,
          ""mappings"": [],
          ""thresholds"": {
            ""mode"": ""absolute"",
            ""steps"": [
              {
                ""color"": ""green"",
                ""value"": 0
              },
              {
                ""color"": ""red"",
                ""value"": 80
              }
            ]
          },
          ""unit"": ""reqpm""
        },
        ""overrides"": []
      },
      ""gridPos"": {
        ""h"": 8,
        ""w"": 12,
        ""x"": 6,
        ""y"": 16
      },
      ""id"": 3,
      ""options"": {
        ""legend"": {
          ""calcs"": [],
          ""displayMode"": ""list"",
          ""placement"": ""bottom"",
          ""showLegend"": true
        },
        ""tooltip"": {
          ""hideZeros"": false,
          ""mode"": ""single"",
          ""sort"": ""none""
        }
      },
      ""pluginVersion"": ""12.3.0"",
      ""targets"": [
        {
          ""editorMode"": ""code"",
          ""expr"": ""rate(http_request_duration_seconds_count[5m]) * 600"",
          ""legendFormat"": ""{{method}} {{route}} {{code}}"",
          ""range"": true,
          ""refId"": ""A""
        }
      ],
      ""title"": ""Http requests"",
      ""type"": ""timeseries""
    }
  ],
  ""preload"": false,
  ""refresh"": ""5s"",
  ""schemaVersion"": 42,
  ""tags"": [],
  ""templating"": {
    ""list"": []
  },
  ""time"": {
    ""from"": ""now-6h"",
    ""to"": ""now""
  },
  ""timepicker"": {},
  ""timezone"": ""browser"",
  ""title"": ""DeadIt "",
  ""uid"": ""addmfp6"",
  ""version"": 0
}";
    }

    public async Task<bool> CreateContactPointAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            // Проверяем, существует ли contact point
            var existingContactPoints = await GetContactPointsAsync(cancellationToken);
            var tgContactPoint = existingContactPoints?.FirstOrDefault(cp => 
                cp.TryGetProperty("name", out var name) && name.GetString() == "TG");

            var contactPointJson = GetContactPointJson();
            var contactPoint = JsonSerializer.Deserialize<JsonElement>(contactPointJson);

            if (tgContactPoint != null && tgContactPoint.ValueKind != JsonValueKind.Null)
            {
                _logger.LogInformation("Contact point 'TG' already exists. Updating...");
                
                // Обновляем существующий contact point
                if (tgContactPoint.TryGetProperty("id", out var id))
                {
                    var updateContent = new StringContent(contactPointJson, Encoding.UTF8, "application/json");
                    var updateResponse = await _httpClient.PutAsync(
                        $"{_grafanaUrl}/api/alert-notifications/{id.GetInt32()}", 
                        updateContent, 
                        cancellationToken);

                    if (updateResponse.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Contact point updated successfully");
                        return true;
                    }
                    else
                    {
                        var errorContent = await updateResponse.Content.ReadAsStringAsync(cancellationToken);
                        _logger.LogError("Failed to update contact point. Status: {Status}, Response: {Response}", 
                            updateResponse.StatusCode, errorContent);
                        return false;
                    }
                }
            }
            else
            {
                _logger.LogInformation("Creating new contact point 'TG'...");
                
                // Создаем новый contact point
                var createContent = new StringContent(contactPointJson, Encoding.UTF8, "application/json");
                var createResponse = await _httpClient.PostAsync(
                    $"{_grafanaUrl}/api/alert-notifications", 
                    createContent, 
                    cancellationToken);

                if (createResponse.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Contact point created successfully");
                    return true;
                }
                else
                {
                    var errorContent = await createResponse.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("Failed to create contact point. Status: {Status}, Response: {Response}", 
                        createResponse.StatusCode, errorContent);
                    return false;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating contact point");
            return false;
        }
    }

    public async Task<bool> CreateAlertRulesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            // Сначала создаем папку для alert rules, если её нет
            var folderName = "DeadIt";
            var folderUid = await GetOrCreateAlertFolderAsync(folderName, cancellationToken);
            
            if (string.IsNullOrEmpty(folderUid))
            {
                _logger.LogWarning("Failed to create/get alert folder. Alert rules creation may fail.");
            }

            // Получаем существующие alert rule groups
            var existingGroups = await GetAlertRuleGroupsAsync(folderUid ?? folderName, cancellationToken);
            var existingGroup = existingGroups?.FirstOrDefault(g => 
                g.TryGetProperty("name", out var name) && name.GetString() == "DeadIt Alerts");
            
            // Если группы нет в массиве, проверяем через прямой запрос
            bool groupExists = existingGroup != null && existingGroup.ValueKind != JsonValueKind.Null;

            var alertRulesJson = GetAlertRulesJson(folderUid ?? folderName);

            if (groupExists && existingGroup != null)
            {
                _logger.LogInformation("Alert rule group 'DeadIt Alerts' already exists. Updating...");
                
                // Обновляем существующую группу правил
                var updateContent = new StringContent(alertRulesJson, Encoding.UTF8, "application/json");
                var updateResponse = await _httpClient.PostAsync(
                    $"{_grafanaUrl}/api/ruler/grafana/api/v1/rules/{folderUid ?? folderName}", 
                    updateContent, 
                    cancellationToken);

                if (updateResponse.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Alert rules updated successfully");
                    return true;
                }
                else
                {
                    var errorContent = await updateResponse.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("Failed to update alert rules. Status: {Status}, Response: {Response}", 
                        updateResponse.StatusCode, errorContent);
                    return false;
                }
            }
            else
            {
                _logger.LogInformation("Creating new alert rule group 'DeadIt Alerts'...");
                
                // Создаем новую группу правил
                var createContent = new StringContent(alertRulesJson, Encoding.UTF8, "application/json");
                var createResponse = await _httpClient.PostAsync(
                    $"{_grafanaUrl}/api/ruler/grafana/api/v1/rules/{folderUid ?? folderName}", 
                    createContent, 
                    cancellationToken);

                if (createResponse.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Alert rules created successfully");
                    return true;
                }
                else
                {
                    var errorContent = await createResponse.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("Failed to create alert rules. Status: {Status}, Response: {Response}", 
                        createResponse.StatusCode, errorContent);
                    return false;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating alert rules");
            return false;
        }
    }

    private async Task<JsonElement[]?> GetContactPointsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_grafanaUrl}/api/alert-notifications", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var jsonDoc = JsonDocument.Parse(content);
                if (jsonDoc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    return jsonDoc.RootElement.EnumerateArray().ToArray();
                }
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error checking for existing contact points");
            return null;
        }
    }

    private async Task<JsonElement[]?> GetAlertRuleGroupsAsync(string folder, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_grafanaUrl}/api/ruler/grafana/api/v1/rules/{folder}", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var jsonDoc = JsonDocument.Parse(content);
                if (jsonDoc.RootElement.ValueKind == JsonValueKind.Object)
                {
                    // Ruler API returns object with folder names as keys
                    if (jsonDoc.RootElement.TryGetProperty(folder, out var folderRules))
                    {
                        if (folderRules.ValueKind == JsonValueKind.Array)
                        {
                            return folderRules.EnumerateArray().ToArray();
                        }
                    }
                }
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error checking for existing alert rule groups");
            return null;
        }
    }

    private async Task<string?> GetOrCreateAlertFolderAsync(string folderName, CancellationToken cancellationToken)
    {
        try
        {
            // Проверяем существующие папки
            var response = await _httpClient.GetAsync($"{_grafanaUrl}/api/ruler/grafana/api/v1/rules", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var jsonDoc = JsonDocument.Parse(content);
                if (jsonDoc.RootElement.ValueKind == JsonValueKind.Object)
                {
                    // Проверяем, существует ли папка
                    if (jsonDoc.RootElement.TryGetProperty(folderName, out _))
                    {
                        _logger.LogInformation("Alert folder '{FolderName}' already exists", folderName);
                        return folderName;
                    }
                }
            }

            // Создаем папку через provisioning API или используем имя как UID
            // В Grafana unified alerting папки создаются автоматически при создании правил
            _logger.LogInformation("Alert folder '{FolderName}' will be created automatically", folderName);
            return folderName;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error checking/creating alert folder");
            return folderName; // Возвращаем имя, пусть API разберется
        }
    }

    private string GetContactPointJson()
    {
        return @"{
  ""name"": ""TG"",
  ""type"": ""telegram"",
  ""settings"": {
    ""bottoken"": ""8466585924:AAF1vwzEuxcGO-1OjvuISUo5avO9UrvLM6A"",
    ""chatid"": ""-5008075700"",
    ""message"": ""{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"",
    ""parse_mode"": ""HTML""
  },
  ""isDefault"": false,
  ""sendReminder"": true,
  ""disableResolveMessage"": false
}";
    }

    private string GetAlertRulesJson(string folderUid)
    {
        return $@"{{
  ""interval"": ""30s"",
  ""name"": ""DeadIt Alerts"",
  ""rules"": [
        {{
          ""uid"": ""high_cpu_usage"",
          ""title"": ""High CPU Usage"",
          ""condition"": ""A"",
          ""data"": [
            {{
              ""refId"": ""A"",
              ""relativeTimeRange"": {{
                ""from"": 300,
                ""to"": 0
              }},
              ""datasourceUid"": ""PBFA97CFB590B2093"",
              ""model"": {{
                ""expr"": ""rate(process_cpu_seconds_total[5m]) * 100 > 80"",
                ""intervalMs"": 1000,
                ""maxDataPoints"": 43200,
                ""refId"": ""A""
              }}
            }}
          ],
          ""noDataState"": ""NoData"",
          ""execErrState"": ""Alerting"",
          ""for"": ""5m"",
          ""annotations"": {{
            ""description"": ""CPU usage is above 80% for service {{{{ $labels.job }}}}. Current value: {{{{ $value }}}}%"",
            ""summary"": ""High CPU usage detected""
          }},
          ""labels"": {{
            ""severity"": ""warning""
          }},
          ""notifications"": [
            ""TG""
          ]
        }},
        {{
          ""uid"": ""high_memory_usage"",
          ""title"": ""High Memory Usage"",
          ""condition"": ""A"",
          ""data"": [
            {{
              ""refId"": ""A"",
              ""relativeTimeRange"": {{
                ""from"": 300,
                ""to"": 0
              }},
              ""datasourceUid"": ""PBFA97CFB590B2093"",
              ""model"": {{
                ""expr"": ""(dotnet_total_memory_bytes / 1024 / 1024 / 1024) > 2"",
                ""intervalMs"": 1000,
                ""maxDataPoints"": 43200,
                ""refId"": ""A""
              }}
            }}
          ],
          ""noDataState"": ""NoData"",
          ""execErrState"": ""Alerting"",
          ""for"": ""5m"",
          ""annotations"": {{
            ""description"": ""Memory usage is above 2GB for service {{{{ $labels.job }}}}. Current value: {{{{ $value }}}}GB"",
            ""summary"": ""High memory usage detected""
          }},
          ""labels"": {{
            ""severity"": ""warning""
          }},
          ""notifications"": [
            ""TG""
          ]
        }},
        {{
          ""uid"": ""database_unavailable"",
          ""title"": ""Database/Service Unavailable"",
          ""condition"": ""A"",
          ""data"": [
            {{
              ""refId"": ""A"",
              ""relativeTimeRange"": {{
                ""from"": 300,
                ""to"": 0
              }},
              ""datasourceUid"": ""PBFA97CFB590B2093"",
              ""model"": {{
                ""expr"": ""up{{job=~""deadit-.*""}} == 0"",
                ""intervalMs"": 1000,
                ""maxDataPoints"": 43200,
                ""refId"": ""A""
              }}
            }}
          ],
          ""noDataState"": ""Alerting"",
          ""execErrState"": ""Alerting"",
          ""for"": ""2m"",
          ""annotations"": {{
            ""description"": ""Service {{{{ $labels.job }}}} is down or database is unavailable"",
            ""summary"": ""Database/Service unavailable""
          }},
          ""labels"": {{
            ""severity"": ""critical""
          }},
          ""notifications"": [
            ""TG""
          ]
        }},
        {{
          ""uid"": ""high_error_rate"",
          ""title"": ""High Error Rate"",
          ""condition"": ""A"",
          ""data"": [
            {{
              ""refId"": ""A"",
              ""relativeTimeRange"": {{
                ""from"": 300,
                ""to"": 0
              }},
              ""datasourceUid"": ""PBFA97CFB590B2093"",
              ""model"": {{
                ""expr"": ""rate(http_request_duration_seconds_count{{code=~""5..""}}[5m]) > 0.1"",
                ""intervalMs"": 1000,
                ""maxDataPoints"": 43200,
                ""refId"": ""A""
              }}
            }}
          ],
          ""noDataState"": ""NoData"",
          ""execErrState"": ""Alerting"",
          ""for"": ""5m"",
          ""annotations"": {{
            ""description"": ""Error rate is high for service {{{{ $labels.job }}}}: {{{{ $value }}}} errors/sec"",
            ""summary"": ""High error rate detected""
          }},
          ""labels"": {{
            ""severity"": ""warning""
          }},
          ""notifications"": [
            ""TG""
          ]
        }},
        {{
          ""uid"": ""no_metrics_available"",
          ""title"": ""No Metrics Available"",
          ""condition"": ""A"",
          ""data"": [
            {{
              ""refId"": ""A"",
              ""relativeTimeRange"": {{
                ""from"": 600,
                ""to"": 0
              }},
              ""datasourceUid"": ""PBFA97CFB590B2093"",
              ""model"": {{
                ""expr"": ""absent_over_time(up{{job=~""deadit-.*""}}[10m])"",
                ""intervalMs"": 1000,
                ""maxDataPoints"": 43200,
                ""refId"": ""A""
              }}
            }}
          ],
          ""noDataState"": ""Alerting"",
          ""execErrState"": ""Alerting"",
          ""for"": ""5m"",
          ""annotations"": {{
            ""description"": ""No metrics available for service {{{{ $labels.job }}}}. Service might be down, metrics endpoint is unreachable, or disk space issues."",
            ""summary"": ""No metrics available - possible disk space issue""
          }},
          ""labels"": {{
            ""severity"": ""critical""
          }},
          ""notifications"": [
            ""TG""
          ]
        }},
        {{
          ""uid"": ""disk_space_warning"",
          ""title"": ""Potential Disk Space Issue"",
          ""condition"": ""A"",
          ""data"": [
            {{
              ""refId"": ""A"",
              ""relativeTimeRange"": {{
                ""from"": 600,
                ""to"": 0
              }},
              ""datasourceUid"": ""PBFA97CFB590B2093"",
              ""model"": {{
                ""expr"": ""absent_over_time(http_request_duration_seconds_count[10m]) and up{{job=~""deadit-.*""}} == 1"",
                ""intervalMs"": 1000,
                ""maxDataPoints"": 43200,
                ""refId"": ""A""
              }}
            }}
          ],
          ""noDataState"": ""NoData"",
          ""execErrState"": ""Alerting"",
          ""for"": ""10m"",
          ""annotations"": {{
            ""description"": ""Service {{{{ $labels.job }}}} is up but not receiving requests. Possible disk space issue preventing logging or data writes."",
            ""summary"": ""Potential disk space issue detected""
          }},
          ""labels"": {{
            ""severity"": ""warning""
          }},
          ""notifications"": [
            ""TG""
          ]
        }}
      ]
    }}";
    }
}

