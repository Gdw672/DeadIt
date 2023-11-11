using DeadIt.Models;
using Microsoft.AspNetCore.Mvc;
using static DeadIt.Controllers.DataBaseController;

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

        public IActionResult Test()
        {
            return View();
        }

        public IActionResult ConcreteTest()
        {
            var nextText = _dataBaseController.UpdateAllInfo2();
         
            return Json(nextText);
        }
    }
}
