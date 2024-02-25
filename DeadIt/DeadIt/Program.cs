using DeadIt.Controllers;
using DeadIt.Controllers.Database;
using DeadIt.Controllers.Database.Interface;
using DeadIt.Controllers.Database.Main;
using DeadIt.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
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
app.UseStaticFiles();
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