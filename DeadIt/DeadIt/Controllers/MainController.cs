using System.Net;
using DeadIt.Service.Database.Interface;
using DeadIt.Service.Images.Interface;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace DeadIt.Controllers
{
    public class MainController : Controller
    {
        private readonly IDataBaseService _dataBaseController;
        private readonly IBackgroundService _backgroundService;

        public MainController (IDataBaseService dataBaseController, IBackgroundService backgroundService)
        {
            _dataBaseController = dataBaseController;
            _backgroundService = backgroundService;
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

        [HttpGet]
        public IActionResult GetBackground()
        {
            var fileBytes = _backgroundService.Getbackground();
            var string64 = Convert.ToBase64String(fileBytes);
            return Ok(string64);
        }

        public record NextChoiceRequest(int Id);    
    }
}
