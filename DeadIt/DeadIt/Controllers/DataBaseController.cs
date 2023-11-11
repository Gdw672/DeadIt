using DeadIt.Models;
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

           _sessionsController.SetString(SessionKeysNames._currentImageName, currentImage._ImageName);
                return currentImage;
            
        }

       /* public Tuple<DBText, DBImages> UpdateAllInfo()
        {
            var dbImage = GetImage("Felix");
            var dbText = UpdateText();
            return Tuple.Create(dbText, dbImage);
        }*/


        public ContentInfoFromDB UpdateAllInfo2()
        {
            var dbText = UpdateText();
            var dbImage = GetImage("Felix");

            return new ContentInfoFromDB(dbText, dbImage);
        }
        public interface IDataBaseController
        {
            public DBImages GetImage(string characterName);
            public DBText UpdateText();
            public ContentInfoFromDB UpdateAllInfo2();


        }
    }
}
