using DeadIt.Models.DatabaseModel;

namespace DeadIt.Controllers.Database.Interface;

public interface IDataBaseController
{ 
        public ContentInfoFromDB UpdateAllInfoWithoutChoice();
        public string UpdateAllInfoWithChoice(int nextChoiceID);
}