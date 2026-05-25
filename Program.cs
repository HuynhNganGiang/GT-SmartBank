using Microsoft.EntityFrameworkCore;
using GTSmartBank.Data;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using System.Text;

var builder = WebApplication.CreateBuilder(args);

#region SERVICES

// =====================================
// 1. CONTROLLERS
// =====================================
builder.Services.AddControllers();


// =====================================
// 2. DATABASE - SQL SERVER
// =====================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));


// =====================================
// 3. JWT AUTHENTICATION
// =====================================
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
{
    throw new InvalidOperationException("Cấu hình khóa ký JWT (Jwt:Key) trong appsettings.json bị thiếu hoặc không đủ mạnh (yêu cầu độ dài tối thiểu 32 ký tự để bảo đảm an toàn cho thuật toán HS256).");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                ClockSkew = TimeSpan.Zero
            };
    });



// =====================================
// 4. AUTHORIZATION
// =====================================
builder.Services.AddAuthorization();


// =====================================
// 5. SWAGGER + JWT SUPPORT
// =====================================
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "GT Smart Bank API",
        Version = "v1",
        Description =
            "Hệ thống quản lý ngân hàng thông minh - ASP.NET Core Web API + SQL Server + JWT Authentication",

        Contact = new OpenApiContact
        {
            Name = "HUỲNH NGÂN GIANG",
            Email = "sonhuynh2014.bt@gmail.com"
        }
    });

    // =====================================
    // JWT AUTHORIZE BUTTON
    // =====================================
    c.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Nhập JWT Token theo dạng: Bearer your_token"
        });

    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});

// =====================================
// 6. BUSINESS SERVICES (DEPENDENCY INJECTION)
// =====================================
builder.Services.AddScoped<GTSmartBank.Services.ICustomerService, GTSmartBank.Services.CustomerService>();
builder.Services.AddScoped<GTSmartBank.Services.IAccountService, GTSmartBank.Services.AccountService>();
builder.Services.AddScoped<GTSmartBank.Services.ITransactionService, GTSmartBank.Services.TransactionService>();
builder.Services.AddScoped<GTSmartBank.Services.IOtpService, GTSmartBank.Services.OtpService>();
builder.Services.AddScoped<GTSmartBank.Services.ISavingsAccountService, GTSmartBank.Services.SavingsAccountService>();

// =====================================
// 7. CORS POLICY
// =====================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("VercelCorsPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000", "http://localhost:5232")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            policy.WithOrigins("https://gtsmartbank.vercel.app")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

#endregion


var app = builder.Build();

#region MIDDLEWARE PIPELINE

// =====================================
// 0. GLOBAL EXCEPTION MIDDLEWARE
// =====================================
app.UseMiddleware<GTSmartBank.Middlewares.ApiExceptionMiddleware>();

// =====================================
// CORS MIDDLEWARE
// =====================================
app.UseCors("VercelCorsPolicy");

// =====================================
// 1. SWAGGER UI
// =====================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "GT Smart Bank API v1"
        );

        c.DocumentTitle = "GT Smart Bank - Banking API";

        // File CSS custom Swagger
        // wwwroot/swagger-ui/custom.css
        c.InjectStylesheet("/swagger-ui/custom.css?v=1.1");

        // Ẩn phần Models
        c.DefaultModelsExpandDepth(-1);

        // Hiển thị thời gian request
        c.DisplayRequestDuration();

        // Mở API dạng list
        c.DocExpansion(
            Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List
        );
    });
}


// =====================================
// 2. STATIC FILES + DEFAULT FILES
// Cho phép chạy giao diện trong wwwroot
// =====================================
app.UseDefaultFiles();

app.UseStaticFiles();


// =====================================
// 3. REDIRECT TRANG CHỦ
// Khi mở localhost sẽ tự vào giao diện
// =====================================
app.MapGet("/", context =>
{
    context.Response.Redirect("/bank-ui/index.html");
    return Task.CompletedTask;
});


// =====================================
// 4. HTTPS
// =====================================
app.UseHttpsRedirection();


// =====================================
// 5. AUTHENTICATION
// Phải đặt trước Authorization
// =====================================
app.UseAuthentication();


// =====================================
// 6. AUTHORIZATION
// =====================================
app.UseAuthorization();


// =====================================
// 7. MAP CONTROLLERS
// =====================================
app.MapControllers();

#endregion


app.Run();