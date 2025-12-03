using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using HtmlToPdfGenerator.Services;

namespace HtmlToPdfGenerator.Pages;

public class IndexModel : PageModel
{
    private readonly NodeJsPdfGeneratorService _nodeJsPdfGeneratorService;

    public string JsonFilePath { get; set; } = "../01ebdf62-b7e5-19e8-8000-00142dc07b4a--c10_2025-09-02_13-01_.json";
    public string OutputPath { get; set; } = "../output.pdf";
    public string Message { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }

    public IndexModel(NodeJsPdfGeneratorService nodeJsPdfGeneratorService)
    {
        _nodeJsPdfGeneratorService = nodeJsPdfGeneratorService;
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
}
