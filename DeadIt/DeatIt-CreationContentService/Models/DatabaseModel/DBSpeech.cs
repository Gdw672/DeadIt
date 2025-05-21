namespace DeatIt_CreationContentService.Models.DatabaseModel
{
    public class DBSpeech
    {
        public string ID { get; set; } = "";
        public string Name { get; set; } = "";
        public string Text { get; set; } = "";
        public string? NextID { get; set; }
    }
}
