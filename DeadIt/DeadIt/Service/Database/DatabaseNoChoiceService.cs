using DeadIt.Models;
using DeadIt.Models.ContentFromDB;
using DeadIt.Models.DatabaseModel;
using DeadIt.Service.Database.Interface;

namespace DeadIt.Service.Database;

public class DatabaseNoChoiceService : IDatabaseNoChoiceService
{
    private readonly IDeadItDBContext _deadItDBContext;
    private readonly ISessionService _sessionsController;

    public DatabaseNoChoiceService(IDeadItDBContext deadItDBContext, ISessionService sessionsController)
    {
        _deadItDBContext = deadItDBContext;
        _sessionsController = sessionsController;
    }

    //ToDO: сделать нормальное сохранение индекса
    private DBText UpdateText()
    {
        var currentIndex = _sessionsController.GetIntForReact();
        var dbText = _deadItDBContext._textDBs.ToList();

        if (currentIndex == null)
        {
            _sessionsController.SetIntForReact(0);
            currentIndex = _sessionsController.GetIntForReact();
        }

        if (currentIndex < dbText.Count)
        {
            var nextText = dbText[(int)currentIndex];
            currentIndex++;
            _sessionsController.SetIntForReact((int)currentIndex); // Сохранение текущего индекса в сессии
            return nextText;
        }

        return null;
    }

    public ContentInfoFromDb UpdateAllInfo()
    {
        var dbText = UpdateText();
        var dbImage = GetImage(dbText._CharacterName);

        if (dbText._NextChoiceID == 0)
        {
            return new ContentInfoFromDb(dbText, dbImage);
        }

        var dbChoice = GetChoices(dbText._NextChoiceID);

        return new ContentInfoFromDb(dbText, dbImage, dbChoice);
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