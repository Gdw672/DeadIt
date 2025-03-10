using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DeatIt_CreationContentService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContentCreationController : ControllerBase
    {
        [HttpGet("GetAnswer")]
        public string GetAnswer()
        {
            return "answer is delivered.";
        }
    }
}
