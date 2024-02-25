using DeadIt.Models.DatabaseModel;

namespace DeadIt.Models.ContentFromDB;

//TODO Сделать наследование с ContentInfoFromDB

public class ContentBase
{
    public DBChoices Choice { get; set; }
    
    public DBImages Image { get; set; }
    
    public ContentBase(DBChoices choice = null, DBImages image = null) 
    {
           Choice = choice;
           Image = image; 
    }
}