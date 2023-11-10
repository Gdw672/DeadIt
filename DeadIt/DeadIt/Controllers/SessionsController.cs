using Microsoft.AspNetCore.Razor.Language.Intermediate;
using Microsoft.Extensions.Caching.Distributed;
using System.Collections.Generic;

namespace DeadIt.Controllers
{
    public class SessionsController : ISessionsController
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public SessionsController(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public void SetInt(string key, int variable)
        {
            _httpContextAccessor.HttpContext.Session.SetInt32(key, variable);
        }

        public int? GetInt(string key)
        {
            var variable = _httpContextAccessor.HttpContext.Session.GetInt32(key); 
            return variable;
        }

        public void SetString(string key, string value)
        {
            _httpContextAccessor.HttpContext.Session.SetString(key, value);
        }

        public string GetString(string key)
        {
            return _httpContextAccessor.HttpContext.Session.GetString(key);
        }
    }
}

public interface ISessionsController
{
    public void SetInt(string key, int variable);
    public int? GetInt(string key);
    public void SetString(string key, string value);
     public string GetString(string key);


}