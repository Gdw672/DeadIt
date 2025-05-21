namespace DeatIt_CreationContentService.Models.DatabaseModel
{
    public class DBChoice
    {
        public string ID { get; set; } = "";
        public string ChoiceType { get; set; } = "";
        public string Name { get; set; } = "";
        public string Text { get; set; } = "";
        public string? NextID { get; set; }
    }
}
