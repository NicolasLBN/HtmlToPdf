using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using HtmlToPdfGenerator.Services;

namespace HtmlToPdfGenerator.Pages;

public class IndexModel : PageModel
{
    private readonly NodeJsPdfGeneratorService _nodeJsPdfGeneratorService;
    private readonly JsonReaderService _jsonReaderService;
    private readonly HtmlReportGeneratorService _htmlReportGeneratorService;
    private readonly HtmlToPdfService _htmlToPdfService;
    private readonly EnhancedPdfGeneratorService _enhancedPdfGeneratorService;

    public string JsonFilePath { get; set; } = "../01ebdf62-b7e5-19e8-8000-00142dc07b4a--c10_2025-09-02_13-01_.json";
    public string OutputPath { get; set; } = "../output.pdf";
    public string Message { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }

    public IndexModel(
        NodeJsPdfGeneratorService nodeJsPdfGeneratorService,
        JsonReaderService jsonReaderService,
        HtmlReportGeneratorService htmlReportGeneratorService,
        HtmlToPdfService htmlToPdfService,
        EnhancedPdfGeneratorService enhancedPdfGeneratorService)
    {
        _nodeJsPdfGeneratorService = nodeJsPdfGeneratorService;
        _jsonReaderService = jsonReaderService;
        _htmlReportGeneratorService = htmlReportGeneratorService;
        _htmlToPdfService = htmlToPdfService;
        _enhancedPdfGeneratorService = enhancedPdfGeneratorService;
    }

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnPostAsync(string jsonFilePath, string outputPath)
    {
        try
        {
            // Resolve relative paths to absolute paths
            var absoluteJsonPath = Path.IsPathRooted(jsonFilePath) 
                ? jsonFilePath 
                : Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), jsonFilePath));
                
            var absoluteOutputPath = Path.IsPathRooted(outputPath) 
                ? outputPath 
                : Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), outputPath));

            // Generate PDF using Node.js script
            await _nodeJsPdfGeneratorService.GeneratePdfAsync(absoluteJsonPath, absoluteOutputPath);

            Message = $"PDF generated successfully at: {absoluteOutputPath}";
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

    public async Task<IActionResult> OnPostGenerateHtmlPdfAsync(string jsonFilePath, string outputPath)
    {
        try
        {
            // Resolve relative paths to absolute paths
            var absoluteJsonPath = Path.IsPathRooted(jsonFilePath) 
                ? jsonFilePath 
                : Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), jsonFilePath));
                
            var absoluteOutputPath = Path.IsPathRooted(outputPath) 
                ? outputPath 
                : Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), outputPath));

            // Read JSON data
            var reportData = _jsonReaderService.ReadJsonFile(absoluteJsonPath);
            
            if (reportData == null)
            {
                throw new InvalidOperationException("Failed to read JSON data");
            }

            // Generate HTML report
            var htmlContent = _htmlReportGeneratorService.GenerateHtmlReport(reportData);
            
            // Save HTML file for inspection (optional, same directory as PDF with .html extension)
            var htmlPath = Path.ChangeExtension(absoluteOutputPath, ".html");
            _htmlToPdfService.SaveHtmlToFile(htmlContent, htmlPath);
            
            // Generate PDF using QuestPDF (enhanced version that matches HTML style)
            var pdfPath = Path.ChangeExtension(absoluteOutputPath, "_enhanced.pdf");
            _enhancedPdfGeneratorService.GeneratePdf(reportData, pdfPath);

            Message = $"PDF generated successfully from .NET at: {pdfPath}\nHTML report saved at: {htmlPath}";
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
