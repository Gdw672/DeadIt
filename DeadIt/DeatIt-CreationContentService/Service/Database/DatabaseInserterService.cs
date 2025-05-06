using DeatIt_CreationContentService.Models;
using DeatIt_CreationContentService.Models.DatabaseModel;
using DeatIt_CreationContentService.Models.DB__Context;
using DeatIt_CreationContentService.Service.Database.Interface;
using System.Text.Json;

namespace DeatIt_CreationContentService.Service.Database
{
    public class DatabaseInserterService : IDatabaseInserterService
    {
        private IContentCreationDBContext contentCreationDBContext;
        public DatabaseInserterService(IContentCreationDBContext contentCreationDBContext)
        {
            this.contentCreationDBContext = contentCreationDBContext;
        }

        public string InsertInfo(List<object> data)
        {
            var jsonData = JsonSerializer.Serialize(data);
            var jsonElement = JsonSerializer.Deserialize<JsonElement>(jsonData);

            var answers = MapData(jsonElement);

            var entities = answers.Select(a => new DBText
            {
                ID = a.Id,
                Type = a.Type,
                Name = a.Name,
                Text = a.Text,
                NextID = a.NextId ?? "None"
            }).ToList();

            contentCreationDBContext.textDBs.AddRange(entities);
            contentCreationDBContext.SaveChanges();

            return "Ok";
        }
        private List<AnswerData> MapData(object data)
        {
            var result = new List<AnswerData>();

            if (data is JsonElement jsonElement && jsonElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in jsonElement.EnumerateArray())
                {
                    result.Add(new AnswerData
                    {
                        Id = item.GetProperty("id").GetString(),
                        Type = item.GetProperty("type").GetString(),
                        Name = item.GetProperty("name").GetString(),
                        Text = item.GetProperty("text").GetString(),
                        NextId = item.GetProperty("nextId").GetString()
                    });
                }
            }

            return result;
        }
    }
}
