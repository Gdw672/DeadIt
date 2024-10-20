using DeadIt.Models.ContentFromDB;
using DeadIt.Models.DatabaseModel;

namespace DeadIt.Service.Database.Interface;

public interface IDataBaseService
{
    public ContentInfoFromDb UpdateAllInfoWithoutChoice();
    public ContentBase UpdateAllInfoWithChoice(int nextChoiceID);
}