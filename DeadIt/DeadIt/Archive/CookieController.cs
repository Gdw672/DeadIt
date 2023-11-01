using Microsoft.CodeAnalysis.CSharp.Syntax;

/*namespace DeadIt.Controllers
{
    public class CookieController : ICookieController
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CookieController(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public void SetCookie(string key, string value)
        {
            if( (key != null) && value != null)
                _httpContextAccessor.HttpContext.Response.Cookies.Append(key, value);
        }

        public string GetCookie(string key)
        {
            if (_httpContextAccessor.HttpContext.Request.Cookies.ContainsKey(key))
            {
                return _httpContextAccessor.HttpContext.Request.Cookies[key];
            }

            return null;
        }
        public void DeleteAllCookies()
        {
            var cookies = _httpContextAccessor.HttpContext.Request.Cookies.Keys;
            foreach (var cookie in cookies)
            {
                _httpContextAccessor.HttpContext.Response.Cookies.Delete(cookie);
            }
        }

        public void SetSessionCookie(string key, string value)
        {
            if (GetCookie(key) == null)
            {
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.None,
                    IsEssential = true,
                };
                _httpContextAccessor.HttpContext.Response.Cookies.Append(key, value, cookieOptions);
            }         
        }
    }

    public interface ICookieController
    {
        public void SetCookie(string key, string value);
        public string GetCookie(string key);
        public void DeleteAllCookies() { }
        public void SetSessionCookie(string key, string value);
    }
}*/