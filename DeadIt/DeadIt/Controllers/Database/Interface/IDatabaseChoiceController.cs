using DeadIt.Models.ContentFromDB;
using DeadIt.Models.DatabaseModel;

namespace DeadIt.Controllers.Database.Interface;

public interface IDatabaseChoiceController
{
    public ContentBase UpdateAllInfo(int nextChoiceID);
}