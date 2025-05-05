using DeatIt_CreationContentService.Models.DB__Context;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var Origins = "dead-it-content-creation-react-app";


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
    options.AddPolicy(Origins, policy =>
    {
        policy.WithOrigins("https://localhost:5181/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3000/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3003/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3004/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
        policy.WithOrigins("http://localhost:3005/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();

    }));

builder.Services.AddDbContext<ContentCreationDBContext>(options =>
    options.UseSqlServer("Server=mssql,1433; Database=DeadItContentCreation; User Id=sa; Password=Lord3009!; TrustServerCertificate=True;"));

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors(Origins);
app.UseAuthorization();

app.MapControllers();

app.Run();
