using DeadIt.Models.ContentFromDB;
using DeadIt.Models.DatabaseModel;
using DeadIt.Service.Database.Interface;

namespace DeadIt.Service.Database.Main
{
    public class DataBaseService : IDataBaseService
    {
        private readonly IDatabaseNoChoiceService _databaseNoChoiceController;
        private readonly IDatabaseChoiceService _databaseChoiceController;

        public DataBaseService(IDatabaseNoChoiceService databaseNoChoiceController, IDatabaseChoiceService databaseChoiceController)
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
