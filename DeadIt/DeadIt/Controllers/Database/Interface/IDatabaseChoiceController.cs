using DeadIt.Models.DatabaseModel;

namespace DeadIt.Controllers.Database.Interface;

public interface IDatabaseChoiceController
{
    public string UpdateAllInfo(int nextChoiceID);
}