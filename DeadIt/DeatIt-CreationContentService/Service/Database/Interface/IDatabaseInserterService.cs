namespace DeatIt_CreationContentService.Service.Database.Interface
{
    public interface IDatabaseInserterService
    {
        public string InsertInfo(List<object> data);
        public List<object> GetAllNodes();
    }
}
