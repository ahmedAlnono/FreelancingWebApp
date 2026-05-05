using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FreelancingApi.Helpers;
using FreelancingApi.Services.Interfaces;
using FreelancingApi.Services.Implementaions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using FreelancingApi.Data;
using Microsoft.EntityFrameworkCore;
using FreelancingApi.Repositories.Interfaces;
using FreelancingApi.Repositories.Implementations;
using Microsoft.Extensions.DependencyInjection;
using Minio;
using FreelancingApi.Middlewares;
using FreelancingApi.Hubs;
using Hangfire;
using Hangfire.Storage.SQLite;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);


var secret = jwtSettings["Secret"] ?? throw new Exception("JWT Secret not configured");
var key = Encoding.ASCII.GetBytes(secret);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Set to true in production
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true, // Validate expiry
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero // No grace period
    };

    // Optional: Handle SignalR or WebSocket tokens
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});


builder.Services.AddAuthorizationBuilder()
        .AddPolicy("AdminOnly", policy =>
                policy.RequireRole("Admin"))
        .AddPolicy("UserOrAdmin", policy =>
            policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "role" &&
        (c.Value == "User" || c.Value == "Admin"))));

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
        ["application/json", "text/plain", "text/json"]
    );
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

// Memory Cache
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
    .AddNpgSql(
        builder.Configuration.GetConnectionString("DefaultConnection")!,
        name: "PostgreSQL",
        tags: ["ready"]);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Chess API",
        Version = "v1",
        Description = "Real-time chess game API with SignalR and PostgreSQL",
        Contact = new OpenApiContact
        {
            Name = "Chess API Support",
            Email = "support@chessapi.com"
        }
    });

    // JWT Authentication in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n" +
                      "Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\n" +
                      "Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddOutputCache(options =>
{
    options.DefaultExpirationTimeSpan = TimeSpan.FromSeconds(30);
});

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
        httpContext => RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", token);
    };
});


builder.Services.AddScoped<IMinioClient>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    return new MinioClient()
        .WithEndpoint(config["MinIO:Endpoint"])
        .WithCredentials(config["MinIO:AccessKey"], config["MinIO:SecretKey"])
        .WithSSL(bool.Parse(config["MinIO:UseSSL"] ?? "false"))
        .Build();
});

builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IJobRepository, JobRepository>();
// Services
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddSingleton<ICacheService, CacheService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();


builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

builder.Services.AddHangfire(config => config
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSQLiteStorage(builder.Configuration.GetConnectionString("HangFire")));

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = Math.Min(Environment.ProcessorCount * 2, 10);
    options.Queues = new[] { "default", "emails", "notifications" };
});


// AutoMapper
builder.Services.AddAutoMapper(cfg => {
    cfg.AddMaps(typeof(Program));
});

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "FreelancingApi_";
});

// Add response caching middleware
builder.Services.AddResponseCaching();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Freelancing API V1");
        c.RoutePrefix = "swagger";
    });
}
if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}
app.UseResponseCaching();
app.MapHealthChecks("/health");
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseIpRateLimiting();


app.UseHangfireDashboard("/hangfire", new DashboardOptions{});

app.MapHub<NotificationHub>("/hubs/notification");

app.Run();

