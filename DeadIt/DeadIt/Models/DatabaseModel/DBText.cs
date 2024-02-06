namespace DeadIt.Models.DatabaseModel
{
    public class DBText
    {
        public string _CharacterName { get; set; } = "";
        public string _Text { get; set; } = "";
        public bool _IsNextChoice { get; set; }
        public int ID { get; set; }
    }
}
