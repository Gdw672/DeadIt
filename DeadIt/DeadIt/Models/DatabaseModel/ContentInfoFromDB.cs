namespace DeadIt.Models.DatabaseModel
{
    public class ContentInfoFromDb
    {
        public ContentInfoFromDb(DBText text = null, DBImages image = null, IEnumerable<DBChoices> choice = null) 
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
