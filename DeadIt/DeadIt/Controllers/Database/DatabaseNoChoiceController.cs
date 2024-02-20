using DeadIt.Controllers.Database.Interface;
using DeadIt.Models;
using DeadIt.Models.DatabaseModel;

namespace DeadIt.Controllers.Database;

public class DatabaseNoChoiceController : IDatabaseNoChoiceController
{
    private readonly IDeadItDBContext _deadItDBContext;
    private readonly ISessionsController _sessionsController;
    
    public DatabaseNoChoiceController(IDeadItDBContext deadItDBContext, ISessionsController sessionsController)
    {
        _deadItDBContext = deadItDBContext;
        _sessionsController = sessionsController;
    }
    
    public DBText UpdateText()
    {
        var currentIndex = _sessionsController.GetInt(SessionKeysNames._currentIndexName);
        var dbText = _deadItDBContext._textDBs.ToList();
            
        if (currentIndex == null)
        {
            _sessionsController.SetInt(SessionKeysNames._currentIndexName, 0);
            currentIndex = _sessionsController.GetInt(SessionKeysNames._currentIndexName);
        }
            
        if (currentIndex < dbText.Count)
        {
            var nextText = dbText[(int)currentIndex];
            currentIndex++;
            _sessionsController.SetInt(SessionKeysNames._currentIndexName, (int)currentIndex);
            return nextText;
        }
            
        return null;
    }
    
    public ContentInfoFromDB UpdateAllInfo()
    {
        var dbText = UpdateText();
        var dbImage = GetImage(dbText._CharacterName);

        if (dbText._NextChoiceID == 0)
        {
            return new ContentInfoFromDB(dbText, dbImage);
        }

        var dbChoice = GetChoices(dbText._NextChoiceID);
            
        return new ContentInfoFromDB(dbText, dbImage, dbChoice);
    }
    
    public DBImages GetImage(string characterName)
    {
        var dbImages = _deadItDBContext._images.ToList();

        DBImages currentImage = dbImages.FirstOrDefault(img => Path.GetFileNameWithoutExtension(img._ImageName) == characterName);

        if (currentImage != null && currentImage._ImageName != SessionKeysNames._currentImageName)
        {
            _sessionsController.SetString(SessionKeysNames._currentImageName, currentImage._ImageName);
            return currentImage;
        }
            
        return new DBImages("There's no image");
    }
    
    //Если в блоке попадается выбор - вызывается этот метод
    public IEnumerable<DBChoices> GetChoices(int choiceId)
    {
        var dbChoices = _deadItDBContext._choices.ToList();
            
        var results = dbChoices.Where(entity => entity.EType == "Choice" && entity.ChoiceID == choiceId);
        return results;
    }
}