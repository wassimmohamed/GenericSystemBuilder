using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Endpoints;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, DateTime Expiration);

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication");

        group.MapPost("/login", (LoginRequest request, IConfiguration config) =>
        {
            // Simple demo authentication - replace with real user validation
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { message = "Username and password are required" });
            }

            // In production, validate against a user store
            // For now, accept any non-empty credentials
            var jwtKey = config["Jwt:Key"]!;
            var issuer = config["Jwt:Issuer"]!;
            var audience = config["Jwt:Audience"]!;
            var expirationMinutes = int.Parse(config["Jwt:ExpirationMinutes"] ?? "60");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, request.Username),
                new Claim(ClaimTypes.NameIdentifier, request.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Results.Ok(new LoginResponse(tokenString, expiration));
        }).WithName("Login").WithOpenApi().AllowAnonymous();
    }
}
