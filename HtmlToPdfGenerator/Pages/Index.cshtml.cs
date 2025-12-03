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

    public string JsonFilePath { get; set; } = "../input-report-data.json";
    public string OutputPath { get; set; } = "../output.pdf";
    public string Message { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }

    public IndexModel(
        NodeJsPdfGeneratorService nodeJsPdfGeneratorService,
        JsonReaderService jsonReaderService,
        HtmlReportGeneratorService htmlReportGeneratorService,
        HtmlToPdfService htmlToPdfService)
    {
        _nodeJsPdfGeneratorService = nodeJsPdfGeneratorService;
        _jsonReaderService = jsonReaderService;
        _htmlReportGeneratorService = htmlReportGeneratorService;
        _htmlToPdfService = htmlToPdfService;
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
            
            // Generate PDF using Puppeteer (includes chart/graph)
            await _htmlToPdfService.ConvertHtmlToPdfAsync(htmlContent, absoluteOutputPath);

            Message = $"PDF generated successfully with Puppeteer at: {absoluteOutputPath}\nHTML report saved at: {htmlPath}";
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
