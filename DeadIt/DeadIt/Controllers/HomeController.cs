using DeadIt.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using DeadIt.Controllers.Database.Interface;
using static DeadIt.Controllers.Database.Main.DataBaseController;

namespace DeadIt.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IDataBaseController _dataBaseController;
        public HomeController(ILogger<HomeController> logger, IDataBaseController dataBaseController)
        {
            _logger = logger;
            _dataBaseController = dataBaseController;
        }
        
        public IActionResult TestUpdate()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
        
        public ActionResult UpdateText()
        {
            var nextText = _dataBaseController.UpdateAllInfoWithoutChoice();
            
            if (nextText != null) 
            {
                return Json(nextText);
            }
            else
            {
                return Json(new { message = "За индексом!" });
            }
        }
    }
}