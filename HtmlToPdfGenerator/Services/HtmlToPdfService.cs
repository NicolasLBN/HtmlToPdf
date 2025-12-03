using PuppeteerSharp;
using PuppeteerSharp.Media;

namespace HtmlToPdfGenerator.Services;

/// <summary>
/// Service that converts HTML to PDF using PuppeteerSharp (headless Chrome).
/// </summary>
public class HtmlToPdfService
{
    private readonly ILogger<HtmlToPdfService> _logger;
    private static bool _browserFetched = false;
    private static readonly SemaphoreSlim _browserFetchLock = new SemaphoreSlim(1, 1);

    public HtmlToPdfService(ILogger<HtmlToPdfService> logger)
    {
        _logger = logger;
    }

    public async Task ConvertHtmlToPdfAsync(string htmlContent, string outputPath)
    {
        try
        {
            _logger.LogInformation("Converting HTML to PDF: {OutputPath}", outputPath);

            // Ensure browser is downloaded (only happens once)
            await EnsureBrowserDownloadedAsync();

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

            _logger.LogInformation("PDF generated successfully at: {OutputPath}", outputPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting HTML to PDF");
            throw;
        }
    }

    private async Task EnsureBrowserDownloadedAsync()
    {
        if (_browserFetched)
            return;

        await _browserFetchLock.WaitAsync();
        try
        {
            if (_browserFetched)
                return;

            _logger.LogInformation("Downloading Chromium browser for PuppeteerSharp...");
            var browserFetcher = new BrowserFetcher();
            await browserFetcher.DownloadAsync();
            _browserFetched = true;
            _logger.LogInformation("Chromium browser downloaded successfully");
        }
        finally
        {
            _browserFetchLock.Release();
        }
    }
    
    public void SaveHtmlToFile(string htmlContent, string outputPath)
    {
        try
        {
            _logger.LogInformation("Saving HTML file: {OutputPath}", outputPath);
            File.WriteAllText(outputPath, htmlContent);
            _logger.LogInformation("HTML file saved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving HTML file");
            throw;
        }
    }
}
