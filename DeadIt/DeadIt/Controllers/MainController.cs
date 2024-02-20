using DeadIt.Controllers.Database.Interface;
using DeadIt.Models.DatabaseModel;
using Microsoft.AspNetCore.Mvc;

namespace DeadIt.Controllers
{
    public class MainController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IDataBaseController _dataBaseController;

        public MainController (ILogger<HomeController> logger, IDataBaseController dataBaseController)
        {
            _logger = logger;
            _dataBaseController = dataBaseController;
        }

        public IActionResult MainTitle()
        {
            return View();
        }

        public IActionResult NextTextWithoutChoice()
        {
            var nextText = _dataBaseController.UpdateAllInfoWithoutChoice();
         
            return Json(nextText);
        }

        [HttpPost]
        public IActionResult  NextTextFromChoice(int nextChoiceID)
        {
            var nextText = _dataBaseController.UpdateAllInfoWithChoice(nextChoiceID);

            Console.WriteLine(nextText);

            return Json(nextText);
        }

        public async Task<IActionResult> Log()
        {
            Console.WriteLine("Test!!!");
            return Ok();
        }
    }
}
