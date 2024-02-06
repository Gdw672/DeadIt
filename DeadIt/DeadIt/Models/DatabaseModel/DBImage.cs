using System.ComponentModel.DataAnnotations;

namespace DeadIt.Models.DatabaseModel
{
    public class DBImages
    {
        public DBImages(string imageName)
        {
            _ImageName = imageName;
        }
        [Key]
        public int ID { get; set; }
        public string _ImageName { get; set; } = "";
        public byte[] _ImageData { get; set; }
    }
}
