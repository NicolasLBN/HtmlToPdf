using HtmlToPdfGenerator.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HtmlToPdfGenerator.Services;

/// <summary>
/// Enhanced PDF generator that creates PDFs matching the HTML layout style.
/// This service uses QuestPDF to directly generate PDFs without requiring HTML-to-PDF conversion.
/// </summary>
public class EnhancedPdfGeneratorService
{
    private readonly ILogger<EnhancedPdfGeneratorService> _logger;

    public EnhancedPdfGeneratorService(ILogger<EnhancedPdfGeneratorService> logger)
    {
        _logger = logger;
    }

    public void GeneratePdf(ReportData reportData, string outputPath)
    {
        try
        {
            _logger.LogInformation("Generating enhanced PDF: {OutputPath}", outputPath);

            var document = Document.Create(container =>
            {
                // First page with metadata
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(15, Unit.Millimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(8).FontFamily("Helvetica"));

                    page.Content()
                        .Column(column =>
                        {
                            // Main metadata table
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(3);
                                    columns.RelativeColumn(3);
                                });

                                // Title row
                                table.Cell().Row(1).ColumnSpan(4)
                                    .Border(0.5f).BorderColor("#000000")
                                    .Padding(5, Unit.Millimetre)
                                    .AlignCenter().AlignMiddle()
                                    .Text("INSTALLATION REPORT")
                                    .FontSize(18).Bold();

                                // Project row
                                table.Cell().Row(2).Column(1)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text("Project").Bold().FontSize(8);
                                
                                table.Cell().Row(2).Column(2).ColumnSpan(2)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text(reportData.Parameters.General.ProjectName).FontSize(8);
                                
                                table.Cell().Row(2).Column(4)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text($"Date: {FormatDate(reportData.Parameters.General.StartDate)}").FontSize(8);

                                // Section row
                                table.Cell().Row(3).Column(1)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text("Section").Bold().FontSize(8);
                                
                                table.Cell().Row(3).Column(2).ColumnSpan(3)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text(reportData.Parameters.General.SectionName).FontSize(8);

                                // Company row
                                table.Cell().Row(4).Column(1)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text("Company").Bold().FontSize(8);
                                
                                table.Cell().Row(4).Column(2).ColumnSpan(2)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text(reportData.Parameters.General.Company).FontSize(8);
                                
                                table.Cell().Row(4).Column(4)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text($"Operator: {reportData.Parameters.General.Operator}").FontSize(8);

                                // GPS row
                                table.Cell().Row(5).Column(1)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text("GPS").Bold().FontSize(8);
                                
                                table.Cell().Row(5).Column(2).ColumnSpan(3)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text(FormatGPS(reportData.Parameters.General.Position)).FontSize(8);

                                // Separator row
                                table.Cell().Row(6).ColumnSpan(4)
                                    .BorderBottom(1).BorderColor("#000000")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text(" ");

                                // Section headers
                                table.Cell().Row(7).Column(1).ColumnSpan(2)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Background("#cccccc")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .AlignCenter()
                                    .Text("DUCT").Bold().FontSize(10);
                                
                                table.Cell().Row(7).Column(3)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Background("#cccccc")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .AlignCenter()
                                    .Text("CABLE").Bold().FontSize(10);
                                
                                table.Cell().Row(7).Column(4)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .Background("#cccccc")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .AlignCenter()
                                    .Text("MACHINE").Bold().FontSize(10);

                                // Data rows
                                var duct = reportData.Parameters.Duct;
                                var cable = reportData.Parameters.Cable;
                                var machine = reportData.Parameters.Machine;

                                // Supplier row
                                AddDataRow(table, 8, 
                                    $"Supplier: {duct.Supplier}", 2,
                                    $"Supplier: {cable.Supplier}", 1,
                                    $"Optijet (SN#{machine.MachineSerialNumber})", 1);

                                // Type row
                                AddDataRow(table, 9,
                                    $"Type: {duct.Configuration}", 2,
                                    $"Type: {cable.Type}", 1,
                                    $"Asset: {machine.ClientSerialNumber}", 1);

                                // Configuration row
                                AddDataRow(table, 10,
                                    $"Configuration: {duct.Configuration}", 2,
                                    $"Diameter: {cable.Diameter} mm, Fibers: {cable.FiberCount}", 1,
                                    $"Lubricator: [{(machine.Lubricator ? "X" : " ")}]", 1);

                                // Color row
                                AddDataRow(table, 11,
                                    $"Color: {duct.Identification}", 2,
                                    $"Reel: {cable.Reel}", 1,
                                    $"Lubricant: {machine.Lubricant}", 1);

                                // Inner Layer row
                                AddDataRow(table, 12,
                                    $"Inner Layer: {duct.InnerLayer}", 2,
                                    $"Installed In: {duct.InstalledIn}", 1,
                                    $"Compressor: {machine.Compressor}", 1);

                                // Temperature row
                                AddDataRow(table, 13,
                                    $"Temperature: {duct.Temperature}°C", 2,
                                    "Cable Temp: 0°C", 1,
                                    $"Aftercooler: [{(machine.Aftercooler ? "X" : " ")}]", 1);

                                // Empty row
                                AddDataRow(table, 14,
                                    " ", 2,
                                    " ", 1,
                                    $"Cable Head: [{(cable.Head ? "X" : " ")}]", 1);

                                // Summary row with bottom border
                                table.Cell().Row(15).Column(1)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .BorderTop(1).BorderColor("#000000")
                                    .Background("#cccccc")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .AlignCenter()
                                    .Text("SUMMARY").Bold().FontSize(10);
                                
                                table.Cell().Row(15).Column(2).ColumnSpan(3)
                                    .Border(0.1f).BorderColor("#5c5c5c")
                                    .BorderTop(1).BorderColor("#000000")
                                    .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
                                    .Text($"Max Push Force: {machine.MaxForce} N").FontSize(8);
                            });
                        });
                });

                // Second page with data table
                if (reportData.Data?.Rows?.Count > 0)
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(15, Unit.Millimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(7).FontFamily("Helvetica"));

                        page.Content()
                            .Column(column =>
                            {
                                column.Item().PaddingBottom(3, Unit.Millimetre).Text("Recorded Data").FontSize(10);

                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(1);
                                        columns.RelativeColumn(2);
                                    });

                                    // Header
                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#f0f0f0").Border(0.5f).BorderColor("#000000")
                                            .Padding(2, Unit.Millimetre).Padding(1, Unit.Millimetre)
                                            .AlignCenter().Text("Length\n[m]").FontSize(7).Bold();
                                        
                                        header.Cell().Background("#f0f0f0").Border(0.5f).BorderColor("#000000")
                                            .Padding(2, Unit.Millimetre).Padding(1, Unit.Millimetre)
                                            .AlignCenter().Text("Pushing Force\n[N]").FontSize(7).Bold();
                                        
                                        header.Cell().Background("#f0f0f0").Border(0.5f).BorderColor("#000000")
                                            .Padding(2, Unit.Millimetre).Padding(1, Unit.Millimetre)
                                            .AlignCenter().Text("Duct Pressure\n[bar]").FontSize(7).Bold();
                                        
                                        header.Cell().Background("#f0f0f0").Border(0.5f).BorderColor("#000000")
                                            .Padding(2, Unit.Millimetre).Padding(1, Unit.Millimetre)
                                            .AlignCenter().Text("Speed\n[m/min]").FontSize(7).Bold();
                                        
                                        header.Cell().Background("#f0f0f0").Border(0.5f).BorderColor("#000000")
                                            .Padding(2, Unit.Millimetre).Padding(1, Unit.Millimetre)
                                            .AlignCenter().Text("Time Duration\n[hh:mm:ss]").FontSize(7).Bold();
                                        
                                        header.Cell().Background("#f0f0f0").Border(0.5f).BorderColor("#000000")
                                            .Padding(2, Unit.Millimetre).Padding(1, Unit.Millimetre)
                                            .AlignCenter().Text("Remarks").FontSize(7).Bold();
                                    });

                                    // Data rows
                                    var startTimestamp = reportData.Data.Rows.Count > 0 && reportData.Data.Rows[0].Count > 6 
                                        ? Convert.ToDouble(reportData.Data.Rows[0][6]) 
                                        : 0;
                                    
                                    var maxRows = Math.Min(100, reportData.Data.Rows.Count);
                                    for (int i = 0; i < maxRows; i++)
                                    {
                                        var row = reportData.Data.Rows[i];
                                        if (row.Count >= 8)
                                        {
                                            var distance = Convert.ToDouble(row[1]);
                                            var speed = Convert.ToDouble(row[2]);
                                            var force = Convert.ToDouble(row[3]);
                                            var blowing = Convert.ToDouble(row[4]);
                                            var stamp = Convert.ToDouble(row[6]);
                                            var comment = row[7]?.ToString() ?? "";

                                            var bgColor = i % 2 == 1 ? "#f9f9f9" : "#ffffff";

                                            table.Cell().Background(bgColor).Border(0.5f).BorderColor("#cccccc")
                                                .Padding(1, Unit.Millimetre).AlignCenter().Text($"{distance:F1}").FontSize(7);
                                            
                                            table.Cell().Background(bgColor).Border(0.5f).BorderColor("#cccccc")
                                                .Padding(1, Unit.Millimetre).AlignCenter().Text($"{force:F0}").FontSize(7);
                                            
                                            table.Cell().Background(bgColor).Border(0.5f).BorderColor("#cccccc")
                                                .Padding(1, Unit.Millimetre).AlignCenter().Text($"{blowing:F1}").FontSize(7);
                                            
                                            table.Cell().Background(bgColor).Border(0.5f).BorderColor("#cccccc")
                                                .Padding(1, Unit.Millimetre).AlignCenter().Text($"{speed:F1}").FontSize(7);
                                            
                                            table.Cell().Background(bgColor).Border(0.5f).BorderColor("#cccccc")
                                                .Padding(1, Unit.Millimetre).AlignCenter().Text(FormatDuration((int)(stamp - startTimestamp))).FontSize(7);
                                            
                                            table.Cell().Background(bgColor).Border(0.5f).BorderColor("#cccccc")
                                                .Padding(1, Unit.Millimetre).AlignCenter().Text(comment).FontSize(7);
                                        }
                                    }
                                });
                            });
                    });
                }
            });

            document.GeneratePdf(outputPath);
            _logger.LogInformation("Enhanced PDF generated successfully at: {OutputPath}", outputPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating enhanced PDF");
            throw;
        }
    }

    private void AddDataRow(TableDescriptor table, uint row, string col1Text, uint col1Span, string col2Text, uint col2Span, string col3Text, uint col3Span)
    {
        table.Cell().Row(row).Column(1).ColumnSpan(col1Span)
            .Border(0.1f).BorderColor("#5c5c5c")
            .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
            .Text(col1Text).FontSize(8);
        
        table.Cell().Row(row).Column((uint)(1 + col1Span)).ColumnSpan(col2Span)
            .Border(0.1f).BorderColor("#5c5c5c")
            .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
            .Text(col2Text).FontSize(8);
        
        table.Cell().Row(row).Column((uint)(1 + col1Span + col2Span)).ColumnSpan(col3Span)
            .Border(0.1f).BorderColor("#5c5c5c")
            .Padding(1, Unit.Millimetre).Padding(0.5f, Unit.Millimetre)
            .Text(col3Text).FontSize(8);
    }

    private string FormatDate(string dateIso)
    {
        if (DateTime.TryParse(dateIso, out DateTime date))
        {
            return date.ToString("dd/MM/yyyy HH:mm");
        }
        return dateIso;
    }

    private string FormatGPS(Position position)
    {
        return $"{position.Lat:F6}, {position.Lng:F6}, {position.Alt:F1}m";
    }

    private string FormatDuration(int milliseconds)
    {
        var seconds = milliseconds / 1000;
        var hours = seconds / 3600;
        var minutes = (seconds % 3600) / 60;
        var secs = seconds % 60;
        return $"{hours:D2}:{minutes:D2}:{secs:D2}";
    }
}
