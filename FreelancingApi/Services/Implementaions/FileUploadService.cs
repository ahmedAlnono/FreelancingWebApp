using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using FreelancingApi.Services.Interfaces;
using Minio.DataModel.Args;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace FreelancingApi.Services.Implementaions;

public class FileUploadService : IFileUploadService
{
    private readonly BlobContainerClient _containerClient;
    private readonly IConfiguration _configuration;
    private readonly string _containerName;
    private bool _containerChecked = false;
    public FileUploadService(IConfiguration configuration)
    {
        _configuration = configuration;
        _containerName = configuration["AzureStorage:ContainerName"] ?? "freelancing-files";

        var connectionString = configuration["AzureStorage:ConnectionString"];
        var blobServiceClient = new BlobServiceClient(connectionString);
        _containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
    }

    private async Task EnsureBucketExists()
    {
        if (_containerChecked) return;

        await _containerClient.CreateIfNotExistsAsync();
        _containerChecked = true;
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
        string contentType = file.ContentType;

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

            // Save as PNG for consistency
            await image.SaveAsync(outputStream, new SixLabors.ImageSharp.Formats.Png.PngEncoder());
            fileBytes = outputStream.ToArray();
            contentType = "image/png";
        }
        else
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            fileBytes = memoryStream.ToArray();
        }

        // Generate unique filename
        var blobName = $"{folder}/{DateTime.UtcNow:yyyy/MM/dd}/{userId}_{Guid.NewGuid()}{extension}";

        // Upload to Azure Blob Storage
        var blobClient = _containerClient.GetBlobClient(blobName);

        using var fileStream = new MemoryStream(fileBytes);
        await blobClient.UploadAsync(fileStream, new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType
            }
        });

        // Return URL (using Azure Blob Storage URL format)
        return GenerateSasUrl(blobClient);
    }

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            // Extract blob name from URL
            var uri = new Uri(fileUrl);
            var blobName = string.Join("", uri.AbsolutePath.Split('/').Skip(2)); // Remove container name from path

            var blobClient = _containerClient.GetBlobClient(blobName);
            var response = await blobClient.DeleteIfExistsAsync();

            return response.Value;
        }
        catch
        {
            return false;
        }
    }


    private string GenerateSasUrl(BlobClient blobClient)
    {
        // For Azurite / development: use StorageSharedKeyCredential
        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = blobClient.BlobContainerName,
            BlobName = blobClient.Name,
            Resource = "b", // "b" = blob
            ExpiresOn = DateTimeOffset.UtcNow.AddHours(24)
        };

        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        // Generate the SAS URI
        return blobClient.GenerateSasUri(sasBuilder).ToString();
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