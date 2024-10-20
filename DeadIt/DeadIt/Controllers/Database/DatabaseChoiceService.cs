using DeadIt.Controllers.Database.Interface;
using DeadIt.Models;
using DeadIt.Models.ContentFromDB;
using DeadIt.Models.DatabaseModel;

namespace DeadIt.Controllers.Database;

public class DatabaseChoiceService : IDatabaseChoiceService
{
    private readonly IDeadItDBContext _deadItDBContext;

    public DatabaseChoiceService(IDeadItDBContext deadItDBContext)
    {
        _deadItDBContext = deadItDBContext;
    }

    public ContentBase UpdateAllInfo(int nextChoiceID)
    {
        var dbChoices = _deadItDBContext._choices.ToList();

        var choice = dbChoices.First(choice => choice.ChoiceID == nextChoiceID && choice.EType == "Text");

        var image = GetImage(choice.CharacterName);

        return new ContentBase(choice, image);
    }
    
    private DBImages GetImage(string characterName)
    {
        var dbImages = _deadItDBContext._images.ToList();

        DBImages currentImage = dbImages.FirstOrDefault(img => Path.GetFileNameWithoutExtension(img._ImageName) == characterName);

        if (currentImage != null)
        {
            return currentImage;
        }
        
        return new DBImages("There's no image");
    }
}