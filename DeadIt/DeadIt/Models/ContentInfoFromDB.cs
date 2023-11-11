namespace DeadIt.Models
{
    public class ContentInfoFromDB
    {
        public ContentInfoFromDB(DBText text, DBImages image) 
        {
           Text = text;
           Image = image;
        }
        public DBText Text { get; set; }
        public DBImages Image { get; set; }
    }

}
