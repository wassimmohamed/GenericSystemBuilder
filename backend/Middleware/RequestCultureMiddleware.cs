using System.Globalization;

namespace Backend.Middleware;

public class RequestCultureMiddleware
{
    private readonly RequestDelegate _next;

    public RequestCultureMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Read language from Accept-Language header
        var language = context.Request.Headers["Accept-Language"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(language))
        {
            // Take the first language tag (e.g. "en-US,en;q=0.9" → "en-US")
            var primaryLanguage = language.Split(',')[0].Trim();
            try
            {
                var culture = new CultureInfo(primaryLanguage);
                CultureInfo.CurrentCulture = culture;
                CultureInfo.CurrentUICulture = culture;
            }
            catch (CultureNotFoundException)
            {
                // Ignore invalid culture, keep default
            }
        }

        // Read timezone from X-Timezone header and store in HttpContext.Items
        var timezone = context.Request.Headers["X-Timezone"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(timezone))
        {
            try
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById(timezone);
                context.Items["ClientTimeZone"] = tz;
            }
            catch (TimeZoneNotFoundException)
            {
                // Invalid timezone identifier; ignore and keep default
                context.Items["ClientTimeZone"] = null;
            }
        }

        await _next(context);
    }
}
