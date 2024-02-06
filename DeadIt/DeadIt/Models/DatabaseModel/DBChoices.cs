using System.ComponentModel.DataAnnotations;

namespace DeadIt.Models.DatabaseModel
{
    public class DBChoices
    {
        [Key]
        public int ID { get; set; }
        public string Text { get; set; } = "";
        public string EType { get; set; } = "";
        public int ChoiceID { get; set; }
        
        public int NextChoiceID { get; set; }
    }

    public enum EChoiceType
    {
        None,
        Text,
        Choice
    }
}

