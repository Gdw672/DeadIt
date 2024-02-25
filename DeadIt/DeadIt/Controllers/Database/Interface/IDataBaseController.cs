using DeadIt.Models.ContentFromDB;
using DeadIt.Models.DatabaseModel;

namespace DeadIt.Controllers.Database.Interface;

public interface IDataBaseController
{ 
        public ContentInfoFromDb UpdateAllInfoWithoutChoice();
        public ContentBase UpdateAllInfoWithChoice(int nextChoiceID);
}