using System.Net;
using DeadIt.Controllers.Database.Interface;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace DeadIt.Controllers
{
    public class MainController : Controller
    {
        private readonly IDataBaseService _dataBaseController;

        public MainController (IDataBaseService dataBaseController)
        {
            _dataBaseController = dataBaseController;
        }

        public IActionResult MainTitle()
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
        public IActionResult NextTextFromChoice([FromBody] NextChoiceRequest nextChoiceID)
        {
            var nextText = _dataBaseController.UpdateAllInfoWithChoice(nextChoiceID.Id);

            return Json(nextText);
        }
        
        public record NextChoiceRequest(int Id);    
    }
}
