namespace DeadIt.Models.DatabaseModel
{
    public class ContentInfoFromDB
    {
        public ContentInfoFromDB(DBText text, DBImages image, IEnumerable<DBChoices> choice = null) 
        {
           Text = text;
           Image = image;
           Choice = choice;
        }
        public DBText Text { get; set; }
        public DBImages Image { get; set; }
        
        public IEnumerable<DBChoices> Choice { get; set; }
    }

}
