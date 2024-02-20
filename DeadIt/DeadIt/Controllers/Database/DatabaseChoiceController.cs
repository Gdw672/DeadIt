using DeadIt.Controllers.Database.Interface;
using DeadIt.Models;
using DeadIt.Models.DatabaseModel;

namespace DeadIt.Controllers.Database;

public class DatabaseChoiceController : IDatabaseChoiceController
{
    private readonly IDeadItDBContext _deadItDBContext;

    public DatabaseChoiceController(IDeadItDBContext deadItDBContext)
    {
        _deadItDBContext = deadItDBContext;
    }

    public string UpdateAllInfo(int nextChoiceID)
    {
        var dbChoices = _deadItDBContext._choices.ToList();

        var text = dbChoices.First(choice => choice.ChoiceID == nextChoiceID && choice.EType == "Text");

        return text.Text;
    }
}