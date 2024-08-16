using System.Fabric;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.EntityFrameworkCore;
using System.Text;
using UserService.Database;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth;

namespace UserService
{
    public static class GoogleTokenValidator
    {
        public static async Task<GoogleJsonWebSignature.Payload> ValidateAsync(string token, string googleClientId)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new[] { googleClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(token, settings);
            return payload;
        }
    }

    internal sealed class UserService : StatelessService
    {
        public UserService(StatelessServiceContext context)
            : base(context)
        { }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting Kestrel on {url}");

                        var builder = WebApplication.CreateBuilder();

                        

                        builder.Services.AddDbContext<UserDbContext>(options =>
                            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);
                        builder.WebHost
                                .UseKestrel()
                                .UseContentRoot(Directory.GetCurrentDirectory())
                                .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                                .UseUrls(url);
                        builder.Services.AddControllers();
                        builder.Services.AddEndpointsApiExplorer();
                        builder.Services.AddSwaggerGen();

                       builder.Services.AddCors(options =>
                       {
                           options.AddPolicy("AllowSpecificOrigin",
                               policy => policy
                                   .WithOrigins("http://localhost:5173")
                                   .AllowAnyHeader()
                                   .AllowAnyMethod()
                                   .AllowCredentials()
                                   .SetIsOriginAllowedToAllowWildcardSubdomains()
                                   .SetPreflightMaxAge(TimeSpan.FromMinutes(10)));
                       });


                        // JWT Authentication
                        var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]);
                        builder.Services.AddAuthentication(options =>
                        {
                            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                        })
                        .AddJwtBearer(options =>
                        {
                            options.RequireHttpsMetadata = false;
                            options.SaveToken = true;
                            options.TokenValidationParameters = new TokenValidationParameters
                            {
                                ValidateIssuerSigningKey = true,
                                IssuerSigningKey = new SymmetricSecurityKey(key),
                                ValidateIssuer = true,
                                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                                ValidateAudience = true,
                                ValidAudience = builder.Configuration["Jwt:Audience"]
                            };
                        })
                        .AddFacebook(options =>
                        {
                            options.ClientId = builder.Configuration["Google:ClientId"];
                            options.ClientSecret = builder.Configuration["Google:ClientSecret"];
                        })
                        .AddGoogle(options =>
                        {
                            options.ClientId = builder.Configuration["Google:ClientId"];
                            options.ClientSecret = builder.Configuration["Google:ClientSecret"];
                        });

                        var app = builder.Build();
                        if (app.Environment.IsDevelopment())
                        {
                            app.UseSwagger();
                            app.UseSwaggerUI();
                        }

                        app.UseCors("AllowSpecificOrigin");

                        app.Use(async (context, next) =>
                        {
                            context.Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
                            context.Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
                            await next();
                        });

                        app.UseRouting();
                        app.UseHttpsRedirection();
                        app.UseStaticFiles();
                        app.UseAuthentication();
                        app.UseAuthorization();

                        app.MapControllers();
                        app.MapGet("/", () => "Hello World!");

                        return app;
                    }))
            };
        }
    }
}
