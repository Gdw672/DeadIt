using DeadIt.Controllers.Database.Interface;
using DeadIt.Models.ContentFromDB;
using DeadIt.Models.DatabaseModel;

namespace DeadIt.Controllers.Database.Main
{
    public class DataBaseController : IDataBaseController
    {
        private readonly IDatabaseNoChoiceController _databaseNoChoiceController;
        private readonly IDatabaseChoiceController _databaseChoiceController;
        
        public DataBaseController(IDatabaseNoChoiceController databaseNoChoiceController, IDatabaseChoiceController databaseChoiceController)
        {
            _databaseNoChoiceController = databaseNoChoiceController;
            _databaseChoiceController = databaseChoiceController;
        }
        
        public ContentInfoFromDb UpdateAllInfoWithoutChoice()
        {
            var nextContent = _databaseNoChoiceController.UpdateAllInfo();

            return nextContent;
        }
        
        public ContentBase UpdateAllInfoWithChoice(int nextChoiceID)
        {
            var nextContent = _databaseChoiceController.UpdateAllInfo(nextChoiceID);

            return nextContent;
        }
    }
}
