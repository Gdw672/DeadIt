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

            var speeches = new List<AnswerData>();
            var choices = new List<AnswerData>();

            foreach (var item in answers)
            {
                if (item.Type == "speech")
                    speeches.Add(item);
                else 
                    choices.Add(item);
            }

            var entitiesSpeech = speeches.Select(a => new DBSpeech
            {
                ID = a.Id,
                Type = a.Type,
                Name = a.Name,
                Text = a.Text,
                NextID = a.NextId ?? null
            }).ToList();

            var entitiesChoice = choices.Select(a => new DBChoice
            {
                ID = a.Id,
                ChoiceType = a.Type,
                Name = a.Name,
                Text = a.Text,
                NextID = a.NextId ?? null
            }).ToList();

            contentCreationDBContext.textDB.AddRange(entitiesSpeech);
            contentCreationDBContext.choiceDB.AddRange(entitiesChoice);

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

                    string nextIds;

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
                    else
                    {
                        nextIds = null;
                    }

                    if(nextIds == "")
                    {
                        nextIds = null;
                    }

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
