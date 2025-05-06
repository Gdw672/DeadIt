using DeatIt_CreationContentService.Models;
using DeatIt_CreationContentService.Service.Database.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DeatIt_CreationContentService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContentCreationController : ControllerBase
    {
        public IDatabaseInserterService databaseInserterService;
        public ContentCreationController(IDatabaseInserterService databaseInserterService)
        {
            this.databaseInserterService = databaseInserterService; 
        }

        [HttpPost("PostData")]
        public IActionResult PostData([FromBody] List<object> data)
        {
            databaseInserterService.InsertInfo(data);
            return Ok (databaseInserterService.InsertInfo(data));
        }
    }
}
