using DeatIt_CreationContentService.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DeatIt_CreationContentService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContentCreationController : ControllerBase
    {
        [HttpPost("PostData")]
        public IActionResult PostData([FromBody] List<object> data)
        {
            return Ok(new { message = "answer is delivered", data });
        }
    }
}
