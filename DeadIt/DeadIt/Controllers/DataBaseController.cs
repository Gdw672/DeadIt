using DeadIt.Models;
using System.Collections;
using static DeadIt.Controllers.DataBaseController;

namespace DeadIt.Controllers
{
    public class DataBaseController : IDataBaseController
    {
        private readonly IDeadItDBContext _deadItDBContext;
        private readonly ISessionsController _sessionsController;
        public DataBaseController(IDeadItDBContext deadItDBContext, ISessionsController sessionsController)
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
            else
            {
                return null;
            }
        }

        public DBImages GetImage(string characterName)
        {
            var dbImages = _deadItDBContext._images.ToList();

            DBImages currentImage = dbImages.FirstOrDefault(img => Path.GetFileNameWithoutExtension(img._ImageName) == characterName);

            if(currentImage != null && currentImage._ImageName != SessionKeysNames._currentImageName)
            {
                _sessionsController.SetString(SessionKeysNames._currentImageName, currentImage._ImageName);
                return currentImage;
            }
            else
                return new DBImages("There's no image");
        }

        public IEnumerable<DBChoices> GetChoices()
        {
            var currentChoice = _sessionsController.GetInt(SessionKeysNames._currentChoiceBlock);
            var dbChoices = _deadItDBContext._choices.ToList();

            if (currentChoice == null)
            {
                _sessionsController.SetInt(SessionKeysNames._currentChoiceBlock, 1);
                currentChoice = _sessionsController.GetInt(SessionKeysNames._currentChoiceBlock);
            }

            if (currentChoice < dbChoices.Count)
            {
                var results = dbChoices.Where(entity => entity.EType == "Choice" && entity.ChoiceID == currentChoice);
                return results;
            }
            else
                return null;
        }

        public DBChoices TestChoice()
        {
            var dbChoice = _deadItDBContext._choices.FirstOrDefault();
            return dbChoice;
        }

        public ContentInfoFromDB UpdateAllInfo()
        {
            var dbText = UpdateText();
            var dbImage = GetImage(dbText._CharacterName);

            return new ContentInfoFromDB(dbText, dbImage);
        }
        public interface IDataBaseController
        {
            public DBImages GetImage(string characterName);
            public DBText UpdateText();
            public IEnumerable<DBChoices> GetChoices();


            public DBChoices TestChoice();
            public ContentInfoFromDB UpdateAllInfo();


        }
    }
}
