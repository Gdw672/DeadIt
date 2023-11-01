using DeadIt.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using System.Diagnostics;
using System.Web;

namespace DeadIt.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IDeadItDBContext _deadItDBContext;
        private readonly ISessionsController _sessionsController;
        private readonly string _currentIndexName = "currentIndex";
        public HomeController(ILogger<HomeController> logger, IDeadItDBContext deadItDBContext, ISessionsController sessionsController)
        {
            _logger = logger;
            _deadItDBContext = deadItDBContext;
            _sessionsController = sessionsController;
        }

        public IActionResult Index()
        {
            var names = _deadItDBContext._textDBs.ToArray();
            return View(names);
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
            var currentIndex = _sessionsController.GetInt(_currentIndexName);
            if (currentIndex == null)
            {
                _sessionsController.SetInt(_currentIndexName, 0);
                 currentIndex = _sessionsController.GetInt(_currentIndexName);
            }
            var db = _deadItDBContext._textDBs.ToList();
            if(currentIndex < db.Count)
            {
                var nextText = db[(int)currentIndex];
                currentIndex++;
                _sessionsController.SetInt(_currentIndexName, (int)currentIndex);
                return Json(nextText);
            }
            else
            {
                return Json(new { message = "За индексом!" });

            }  
        }
    }
}