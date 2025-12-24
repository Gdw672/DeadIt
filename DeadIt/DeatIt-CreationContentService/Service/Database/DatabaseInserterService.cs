using DeatIt_CreationContentService.Models;
using DeatIt_CreationContentService.Models.DatabaseModel;
using DeatIt_CreationContentService.Models.DB__Context;
using DeatIt_CreationContentService.Service.Database.Interface;
using System.Text.Json;

namespace DeatIt_CreationContentService.Service.Database
{
    public class DatabaseInserterService : IDatabaseInserterService
    {
        private readonly IContentCreationDBContext contentCreationDBContext;

        public DatabaseInserterService(IContentCreationDBContext contentCreationDBContext)
        {
            this.contentCreationDBContext = contentCreationDBContext;
        }

        public string InsertInfo(List<object> data)
        {
            // Сериализуем и десериализуем в JsonElement для удобной обработки
            var jsonData = JsonSerializer.Serialize(data);
            var jsonElement = JsonSerializer.Deserialize<JsonElement>(jsonData);

            var answers = MapData(jsonElement);

            var speeches = answers.Where(a => a.Type == "speech").ToList();
            var choices = answers.Where(a => a.Type != "speech").ToList();

            // Создаем сущности для EF
            var entitiesSpeech = speeches.Select(a => new DBSpeech
            {
                ID = "s-" + a.Id.Split("-")[1],
                Name = a.Name,
                Text = a.Text,
                NextID = a.NextId?.Replace("choice", "c")?.Replace("speech", "s")
            }).ToList();

            var entitiesChoice = choices.Select(a => new DBChoice
            {
                ID = "c-" + a.Id.Split("-")[1],
                ChoiceType = a.Type,
                Name = a.Name,
                Text = a.Text,
                NextID = a.NextId?.Replace("choice", "c")?.Replace("speech", "s")
            }).ToList();

            // -------------------
            // Безопасный upsert
            // -------------------

            // Для Speech
            foreach (var speech in entitiesSpeech)
            {
                var existing = contentCreationDBContext.textDB.FirstOrDefault(s => s.ID == speech.ID);
                if (existing != null)
                {
                    // Обновляем существующую запись
                    existing.Name = speech.Name;
                    existing.Text = speech.Text;
                    existing.NextID = speech.NextID;
                }
                else
                {
                    // Добавляем новую запись
                    contentCreationDBContext.textDB.Add(speech);
                }
            }

            // Для Choice
            foreach (var choice in entitiesChoice)
            {
                var existing = contentCreationDBContext.choiceDB.FirstOrDefault(c => c.ID == choice.ID);
                if (existing != null)
                {
                    existing.Name = choice.Name;
                    existing.Text = choice.Text;
                    existing.ChoiceType = choice.ChoiceType;
                    existing.NextID = choice.NextID;
                }
                else
                {
                    contentCreationDBContext.choiceDB.Add(choice);
                }
            }

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
                    var nextIdsProperty = item.GetProperty("nextIds");
                    string nextIds = null;

                    if (nextIdsProperty.ValueKind == JsonValueKind.Array)
                    {
                        nextIds = string.Join(", ", nextIdsProperty
                            .EnumerateArray()
                            .Select(x => x.GetString()?.Trim())
                            .Where(s => !string.IsNullOrEmpty(s)));
                    }
                    else if (nextIdsProperty.ValueKind == JsonValueKind.String)
                    {
                        nextIds = nextIdsProperty.GetString()?.Trim();
                    }

                    if (string.IsNullOrEmpty(nextIds))
                        nextIds = null;

                    result.Add(new AnswerData
                    {
                        Id = item.GetProperty("id").GetString(),
                        Type = item.GetProperty("type").GetString(),
                        Name = item.GetProperty("name").GetString(),
                        Text = item.GetProperty("text").GetString(),
                        NextId = nextIds
                    });
                }
            }

            return result;
        }
    }
}
