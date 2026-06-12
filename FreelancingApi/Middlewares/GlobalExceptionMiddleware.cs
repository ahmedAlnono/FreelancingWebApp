using System.Net;
using System.Text.Json;
using FreelancingApi.Models.Dtos;

namespace FreelancingApi.Middlewares;

public class GlobalExceptionMiddleware(
    RequestDelegate next)
{

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception e)
        {
            await HandleExceptionAsync(context, e);
        }
    }
    
    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        
        var response = ApiResponseDto<object>.Fail(
            "Some Thing Wrong Happend. Please try again later.",
            [exception.Message]
        );
        
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}