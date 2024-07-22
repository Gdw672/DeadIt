namespace DeadIt.Controllers
{
    public class SessionService : ISessionService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public static int? index;
        public SessionService(IHttpContextAccessor httpContextAccessor)
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

        public void SetIntForReact(int value)
        {
            index = value;
        }

        public int? GetIntForReact()
        {
            return index;
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

public interface ISessionService
{
    public void SetInt(string key, int variable);
    public int? GetInt(string key);

    public void SetIntForReact(int value);
    
    public int? GetIntForReact();
    
    public void SetString(string key, string value);


}