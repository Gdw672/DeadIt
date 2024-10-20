using DeadIt.Models.ContentFromDB;
using DeadIt.Models.DatabaseModel;

namespace DeadIt.Service.Database.Interface;

public interface IDatabaseChoiceService
{
    public ContentBase UpdateAllInfo(int nextChoiceID);
}