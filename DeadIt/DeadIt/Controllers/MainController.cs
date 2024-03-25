using DeadIt.Controllers.Database.Interface;
using Microsoft.AspNetCore.Mvc;

namespace DeadIt.Controllers
{
    public class MainController : Controller
    {
        private readonly IDataBaseController _dataBaseController;

        public MainController (IDataBaseController dataBaseController)
        {
            _dataBaseController = dataBaseController;
        }

        public IActionResult MainTitle()
        {
            return View();
        }

        public IActionResult TestReact()
        {
            return View();
        }
        
        [HttpGet]
        public IActionResult NextTextWithoutChoice()
        {
            var nextText = _dataBaseController.UpdateAllInfoWithoutChoice();
         
            return Json(nextText);
        }

        [HttpPost]
        public IActionResult NextTextFromChoice(int nextChoiceID)
        {
            var nextText = _dataBaseController.UpdateAllInfoWithChoice(nextChoiceID);

            return Json(nextText);
        }
    }
}
