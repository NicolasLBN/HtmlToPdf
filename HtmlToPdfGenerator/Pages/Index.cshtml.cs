using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using HtmlToPdfGenerator.Services;

namespace HtmlToPdfGenerator.Pages;

public class IndexModel : PageModel
{
    private readonly JsonReaderService _jsonReaderService;
    private readonly PdfGeneratorService _pdfGeneratorService;

    public string JsonFilePath { get; set; } = "../01ebdf62-b7e5-19e8-8000-00142dc07b4a--c10_2025-09-02_13-01_.json";
    public string OutputPath { get; set; } = "../output.pdf";
    public string Message { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }

    public IndexModel(JsonReaderService jsonReaderService, PdfGeneratorService pdfGeneratorService)
    {
        _jsonReaderService = jsonReaderService;
        _pdfGeneratorService = pdfGeneratorService;
    }

    public void OnGet()
    {
    }

    public IActionResult OnPost(string jsonFilePath, string outputPath)
    {
        try
        {
            // Read JSON file
            var reportData = _jsonReaderService.ReadJsonFile(jsonFilePath);
            
            if (reportData == null)
            {
                Message = "Failed to parse JSON file.";
                IsSuccess = false;
                JsonFilePath = jsonFilePath;
                OutputPath = outputPath;
                return Page();
            }

            // Generate PDF
            _pdfGeneratorService.GeneratePdf(reportData, outputPath);

            Message = $"PDF generated successfully at: {outputPath}";
            IsSuccess = true;
            JsonFilePath = jsonFilePath;
            OutputPath = outputPath;
        }
        catch (Exception ex)
        {
            Message = $"Error: {ex.Message}";
            IsSuccess = false;
            JsonFilePath = jsonFilePath;
            OutputPath = outputPath;
        }

        return Page();
    }
}
