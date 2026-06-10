using FreelancingApi.Services.Interfaces;
using Minio;
using Minio.DataModel.Args;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace FreelancingApi.Services.Implementaions;

public class FileUploadService(IMinioClient minioClient, IConfiguration configuration) : IFileUploadService
{
    private readonly string _bucketName = configuration["MinIO:BucketName"] ?? "freelancing-files";
    private bool _bucketChecked = false;

    private async Task EnsureBucketExists()
    {
        if (_bucketChecked) return;

        var found = await minioClient.BucketExistsAsync(new BucketExistsArgs()
            .WithBucket(_bucketName));

        if (!found)
        {
            await minioClient.MakeBucketAsync(new MakeBucketArgs()
                .WithBucket(_bucketName));
        }
        _bucketChecked = true;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder, int userId)
    {
        await EnsureBucketExists();
        // Validate file
        if (file == null || file.Length == 0)
            throw new ArgumentException("No file provided");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx" };
        var extension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException("File type not allowed");

        // Process image if it's an image file
        byte[] fileBytes;
        if (extension is ".jpg" or ".jpeg" or ".png" or ".gif")
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            using var image = Image.Load(memoryStream);

            // Resize large images (max 1200px)
            if (image.Width > 1200 || image.Height > 1200)
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(1200, 1200),
                    Mode = ResizeMode.Max
                }));
            }

            using var outputStream = new MemoryStream();
            await image.SaveAsync(outputStream, new SixLabors.ImageSharp.Formats.Png.PngEncoder());
            fileBytes = outputStream.ToArray();
        }
        else
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            fileBytes = memoryStream.ToArray();
        }

        // Generate unique filename
        var fileName = $"{folder}/{DateTime.UtcNow:yyyy/MM/dd}/{userId}_{Guid.NewGuid()}{extension}";

        // Upload to MinIO/S3
        using var fileStream = new MemoryStream(fileBytes);
        await minioClient.PutObjectAsync(new PutObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(fileName)
            .WithStreamData(fileStream)
            .WithObjectSize(fileStream.Length)
            .WithContentType(file.ContentType));

        // Return URL
        return $"{configuration["MinIO:Endpoint"]}/{_bucketName}/{fileName}";
    }

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            // Extract object name from URL
            var uri = new Uri(fileUrl);
            var objectName = uri.AbsolutePath.TrimStart('/').Replace($"{_bucketName}/", "");

            await minioClient.RemoveObjectAsync(new RemoveObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName));

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> UploadProfileImageAsync(IFormFile file, int userId)
    {
        return await UploadFileAsync(file, "profiles", userId);
    }


    public async Task<string> UploadCoverImageAsync(IFormFile file, int userId)
    {
        return await UploadFileAsync(file, "covers", userId);
    }
}