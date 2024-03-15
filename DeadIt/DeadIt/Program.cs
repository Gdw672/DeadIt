using DeadIt.Controllers;
using DeadIt.Controllers.Database;
using DeadIt.Controllers.Database.Interface;
using DeadIt.Controllers.Database.Main;
using DeadIt.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.FileProviders;
using static DeadIt.Controllers.Database.Main.DataBaseController;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

SetupTransient();

builder.Services.AddHttpContextAccessor();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();

builder.Services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

builder.Services.AddDbContext<DeadItDBContext>(options => options.UseSqlServer("Server = NANOMACHINE; Database = DeadIt; Trusted_Connection=True; TrustServerCertificate=true;"));

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

SetupStaticFiles();

Console.WriteLine(AppDomain.CurrentDomain.BaseDirectory + "dsdsdfdsf");

app.UseSession();
app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Main}/{action=MainTitle}/{id?}");

app.Run();

void SetupTransient()
{
    builder.Services.AddTransient<IDeadItDBContext, DeadItDBContext>();
    builder.Services.AddTransient<ISessionsController, SessionsController>();
    builder.Services.AddTransient<IDataBaseController, DataBaseController>();
    builder.Services.AddTransient<IDatabaseChoiceController, DatabaseChoiceController>();
    builder.Services.AddTransient<IDatabaseNoChoiceController, DatabaseNoChoiceController>();
}

//ToDo: разобраться с путем к проекту, чтобы не указывать путь целиком.
void SetupStaticFiles()
{
    app.UseStaticFiles();

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine("D:\\DeadIt\\DeadIt\\dead-it-react-app\\node_modules\\react\\umd")),
        RequestPath = "/react"
    });

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine("D:\\DeadIt\\DeadIt\\dead-it-react-app\\node_modules\\react-dom\\umd")),
        RequestPath = "/react-dom"
    });
}