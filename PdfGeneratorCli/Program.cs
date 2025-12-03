using System.Diagnostics;
using HtmlToPdfGenerator.Models;
using HtmlToPdfGenerator.Services;
using PuppeteerSharp;
using PuppeteerSharp.Media;

return await Run(args);

static async Task<int> Run(string[] args)
{
    Console.WriteLine("HTML to PDF Generator");
    Console.WriteLine("=====================\n");

    string jsonFilePath = "../input-report-data.json";
    string outputPath = "../output-enhanced.pdf";

    // Allow command line arguments to override defaults
    if (args.Length >= 1)
    {
        jsonFilePath = args[0];
    }
    if (args.Length >= 2)
    {
        outputPath = args[1];
    }

    // Resolve to absolute paths
    jsonFilePath = Path.GetFullPath(jsonFilePath);
    outputPath = Path.GetFullPath(outputPath);

    Console.WriteLine($"Input JSON: {jsonFilePath}");
    Console.WriteLine($"Output PDF: {outputPath}\n");

    if (!File.Exists(jsonFilePath))
    {
        Console.WriteLine($"Error: Input JSON file not found: {jsonFilePath}");
        return 1;
    }

    try
    {
        // Generate enhanced HTML with charts
        Console.WriteLine("Generating HTML report with charts...");
        var jsonReaderService = new JsonReaderService();
        var htmlReportGeneratorService = new HtmlReportGeneratorService();
        
        var reportData = jsonReaderService.ReadJsonFile(jsonFilePath);
        if (reportData == null)
        {
            Console.WriteLine("Error: Failed to read JSON data");
            return 1;
        }
        
        var htmlContent = htmlReportGeneratorService.GenerateHtmlReport(reportData);
        var htmlPath = Path.ChangeExtension(outputPath, ".html");
        File.WriteAllText(htmlPath, htmlContent);
        Console.WriteLine($"HTML report saved to: {htmlPath}");
        
        // Convert HTML to PDF using PuppeteerSharp
        Console.WriteLine("\nConverting HTML to PDF using Puppeteer...");
        var htmlToPdfService = new HtmlToPdfServiceWrapper();
        
        await htmlToPdfService.ConvertHtmlToPdfAsync(htmlContent, outputPath);
        Console.WriteLine($"\nSuccess! PDF generated at: {outputPath}");
        
        return 0;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"\nError: {ex.Message}");
        Console.WriteLine(ex.StackTrace);
        return 1;
    }
}

// Simple wrapper for HtmlToPdfService that handles the PDF conversion
class HtmlToPdfServiceWrapper
{
    public async Task ConvertHtmlToPdfAsync(string htmlContent, string outputPath)
    {
        // Ensure browser is downloaded (only happens once)
        var browserFetcher = new BrowserFetcher();
        await browserFetcher.DownloadAsync();

        // Launch browser
        var launchOptions = new LaunchOptions
        {
            Headless = true,
            Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
        };

        await using var browser = await Puppeteer.LaunchAsync(launchOptions);
        await using var page = await browser.NewPageAsync();

        // Set content and wait for it to load
        await page.SetContentAsync(htmlContent);
        await page.WaitForNetworkIdleAsync();

        // Generate PDF
        var pdfOptions = new PdfOptions
        {
            Format = PaperFormat.A4,
            PrintBackground = true,
            MarginOptions = new MarginOptions
            {
                Top = "10mm",
                Bottom = "10mm",
                Left = "10mm",
                Right = "10mm"
            }
        };

        await page.PdfAsync(outputPath, pdfOptions);
    }
}


