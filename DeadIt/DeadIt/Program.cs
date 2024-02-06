using DeadIt.Controllers;
using DeadIt.Controllers.Database;
using DeadIt.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using static DeadIt.Controllers.Database.DataBaseController;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddTransient<IDeadItDBContext, DeadItDBContext>();
builder.Services.AddTransient<ISessionsController, SessionsController>();
builder.Services.AddTransient<IDataBaseController, DataBaseController>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();

builder.Services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

builder.Services.AddDbContext<DeadItDBContext>(options => options.UseSqlServer("Server = NANOMACHINE; Database = DeadIt; Trusted_Connection=True; TrustServerCertificate=true;"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
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

//app.MapGet("/", (DeadItDBContext db) => db._textDBs.Select(x => x._CharacterName).ToList());

app.Run();
