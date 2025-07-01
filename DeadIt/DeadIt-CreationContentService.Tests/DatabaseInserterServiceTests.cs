using DeatIt_CreationContentService.Models;
using DeatIt_CreationContentService.Models.DatabaseModel;
using DeatIt_CreationContentService.Models.DB__Context;
using DeatIt_CreationContentService.Service.Database;
using DeatIt_CreationContentService.Service.Database.Interface;
using Moq;
using System.Text.Json;
using Xunit;
using static System.Net.Mime.MediaTypeNames;

namespace DeadIt_CreationContentService.Tests
{
    public class DatabaseInserterServiceTests
    {
        [Fact]
        public void MapDataTest()
        {
            //arrange

            //Json приходит в форме string
            var jsonString = @"
    [
        {
            ""id"": ""speech-1"",
            ""type"": ""Speech"",
            ""name"": ""Kirill"",
            ""text"": ""hi!!"",
            ""nextIds"": [""speech-2""]
        },
        {
            ""id"": ""speech-2"",
            ""type"": ""Speech"",
            ""name"": ""Vanya"",
            ""text"": ""Hi!!"",
            ""nextIds"": null
        }
    ]";
            using var jsonDoc = JsonDocument.Parse(jsonString);
            var jsonElement = jsonDoc.RootElement;

            var expected = new List<AnswerData>();
            expected.Add(new AnswerData() { Id = "speech-1", Type = "Speech", Name = "Kirill", Text = "hi!!", NextId = "speech-2" });
            expected.Add(new AnswerData() { Id = "speech-2", Type = "Speech", Name = "Vanya", Text = "Hi!!", NextId = null });

            //act

            var mockDbContext = new Mock<IContentCreationDBContext>();
            DatabaseInserterService databaseInserterService = new DatabaseInserterService(mockDbContext.Object);

            var actual = databaseInserterService.MapData(jsonElement);

            //assert

            Assert.Equal(expected.Count, actual.Count);

            for (int i = 0; i < expected.Count; i++)
            {
                Assert.Equal(expected[i].Name, actual[i].Name);
                Assert.Equal(expected[i].Text, actual[i].Text);
                Assert.Equal(expected[i].Type, actual[i].Type);
                Assert.Equal(expected[i].Id, actual[i].Id);
                Assert.Equal(expected[i].NextId, actual[i].NextId);
            }
        }
    }
}