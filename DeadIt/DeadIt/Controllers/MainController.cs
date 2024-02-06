using DeadIt.Models;
using Microsoft.AspNetCore.Mvc;
using static DeadIt.Controllers.Database.DataBaseController;

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

        public IActionResult Test()
        {
            return View(_dataBaseController.GetChoices());
        }

        public IActionResult ConcreteTest()
        {
            var nextText = _dataBaseController.UpdateAllInfo();
         
            return Json(nextText);
        }
    }
}
