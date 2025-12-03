using PdfGeneratorCli.Services;
using QuestPDF.Infrastructure;

// Configure QuestPDF license once at startup
QuestPDF.Settings.License = LicenseType.Community;

Console.WriteLine("HTML to PDF Generator");
Console.WriteLine("=====================\n");

string jsonFilePath = "/home/runner/work/HtmlToPdf/HtmlToPdf/01ebdf62-b7e5-19e8-8000-00142dc07b4a--c10_2025-09-02_13-01_.json";
string outputPath = "/home/runner/work/HtmlToPdf/HtmlToPdf/generated_report.pdf";

// Allow command line arguments to override defaults
if (args.Length >= 1)
{
    jsonFilePath = args[0];
}
if (args.Length >= 2)
{
    outputPath = args[1];
}

Console.WriteLine($"Input JSON: {jsonFilePath}");
Console.WriteLine($"Output PDF: {outputPath}\n");

try
{
    var jsonReaderService = new JsonReaderService();
    var pdfGeneratorService = new PdfGeneratorService();

    Console.WriteLine("Reading JSON file...");
    var reportData = jsonReaderService.ReadJsonFile(jsonFilePath);

    if (reportData == null)
    {
        Console.WriteLine("Error: Failed to parse JSON file.");
        Environment.Exit(1);
    }

    Console.WriteLine($"JSON parsed successfully. ID: {reportData.Id}");
    Console.WriteLine($"Project: {reportData.Parameters.General.ProjectName}");
    Console.WriteLine($"Data points: {reportData.Data.Rows.Count}");

    Console.WriteLine("\nGenerating PDF...");
    pdfGeneratorService.GeneratePdf(reportData, outputPath);

    Console.WriteLine($"\nSuccess! PDF generated at: {outputPath}");
}
catch (Exception ex)
{
    Console.WriteLine($"\nError: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
    Environment.Exit(1);
}
