using DeadIt.Service.Images.Interface;

namespace DeadIt.Service.Images
{
    public class BackgroundService : IBackgroundService
    {
        public byte[] Getbackground()
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images", "Background", "test-back.jpg");
            return System.IO.File.ReadAllBytes(filePath);
        }
    }
}
