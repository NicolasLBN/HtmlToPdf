using HtmlToPdfGenerator.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HtmlToPdfGenerator.Services;

public class PdfGeneratorService
{
    public void GeneratePdf(ReportData reportData, string outputPath)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(20);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                page.Header()
                    .Height(120)
                    .Background(Colors.Grey.Lighten3)
                    .Padding(10)
                    .Column(column =>
                    {
                        column.Item().Text("Report").FontSize(18).Bold();
                        column.Item().PaddingTop(5).Text($"Project: {reportData.Parameters.General.ProjectName}");
                        column.Item().Text($"Section: {reportData.Parameters.General.SectionName}");
                        column.Item().Text($"Company: {reportData.Parameters.General.Company}");
                        column.Item().Text($"Operator: {reportData.Parameters.General.Operator}");
                        column.Item().Text($"Date: {FormatDate(reportData.Parameters.General.StartDate)}");
                    });

                page.Content()
                    .PaddingVertical(10)
                    .Column(column =>
                    {
                        // Metadata Section
                        column.Item().Text("General Information").FontSize(14).Bold();
                        column.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(100);
                                columns.RelativeColumn();
                            });

                            AddTableRow(table, "Project Name", reportData.Parameters.General.ProjectName);
                            AddTableRow(table, "Section Name", reportData.Parameters.General.SectionName);
                            AddTableRow(table, "Company", reportData.Parameters.General.Company);
                            AddTableRow(table, "Operator", reportData.Parameters.General.Operator);
                            AddTableRow(table, "Start Date", FormatDate(reportData.Parameters.General.StartDate));
                            AddTableRow(table, "GPS Position", FormatGpsPosition(reportData.Parameters.General.Position));
                        });

                        // Machine Information
                        column.Item().PaddingTop(10).Text("Machine Information").FontSize(14).Bold();
                        column.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(100);
                                columns.RelativeColumn();
                            });

                            AddTableRow(table, "Machine Name", reportData.Parameters.Machine.Name);
                            AddTableRow(table, "Serial Number", reportData.Parameters.Machine.MachineSerialNumber);
                            AddTableRow(table, "Client SN", reportData.Parameters.Machine.ClientSerialNumber);
                            AddTableRow(table, "Max Force", $"{reportData.Parameters.Machine.MaxForce} N");
                            AddTableRow(table, "Lubricator", reportData.Parameters.Machine.Lubricator ? "Yes" : "No");
                            AddTableRow(table, "Aftercooler", reportData.Parameters.Machine.Aftercooler ? "Yes" : "No");
                            AddTableRow(table, "Lubricant", reportData.Parameters.Machine.Lubricant);
                        });

                        // Duct Information
                        column.Item().PaddingTop(10).Text("Duct Information").FontSize(14).Bold();
                        column.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(100);
                                columns.RelativeColumn();
                            });

                            AddTableRow(table, "Identification", reportData.Parameters.Duct.Identification);
                            AddTableRow(table, "Installed In", reportData.Parameters.Duct.InstalledIn);
                            AddTableRow(table, "Supplier", reportData.Parameters.Duct.Supplier);
                            AddTableRow(table, "Inner Layer", reportData.Parameters.Duct.InnerLayer);
                            AddTableRow(table, "Temperature", $"{reportData.Parameters.Duct.Temperature}°C");
                        });

                        // Cable Information
                        column.Item().PaddingTop(10).Text("Cable Information").FontSize(14).Bold();
                        column.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(100);
                                columns.RelativeColumn();
                            });

                            AddTableRow(table, "Type", reportData.Parameters.Cable.Type);
                            AddTableRow(table, "Diameter", $"{reportData.Parameters.Cable.Diameter} mm");
                            AddTableRow(table, "Fiber Count", reportData.Parameters.Cable.FiberCount.ToString());
                            AddTableRow(table, "Supplier", reportData.Parameters.Cable.Supplier);
                            AddTableRow(table, "Reel", reportData.Parameters.Cable.Reel);
                            AddTableRow(table, "Head", reportData.Parameters.Cable.Head ? "Yes" : "No");
                        });

                        // Data Summary
                        column.Item().PaddingTop(10).Text("Data Summary").FontSize(14).Bold();
                        column.Item().PaddingTop(5).Text($"Total Data Points: {reportData.Data.Rows.Count}");
                        
                        if (reportData.Data.Rows.Count > 0)
                        {
                            var firstRow = reportData.Data.Rows[0];
                            var lastRow = reportData.Data.Rows[^1];
                            column.Item().Text($"Start: {GetRowValue(firstRow, 0)}");
                            column.Item().Text($"End: {GetRowValue(lastRow, 0)}");
                        }
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("Page ");
                        text.CurrentPageNumber();
                        text.Span(" of ");
                        text.TotalPages();
                    });
            });

            // Add second page with data table
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(20);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(8));

                page.Header()
                    .Height(30)
                    .Background(Colors.Grey.Lighten3)
                    .Padding(10)
                    .Text("Recorded Data").FontSize(14).Bold();

                page.Content()
                    .PaddingVertical(10)
                    .Table(table =>
                    {
                        // Define columns based on headers
                        table.ColumnsDefinition(columns =>
                        {
                            foreach (var _ in reportData.Data.Header)
                            {
                                columns.RelativeColumn();
                            }
                        });

                        // Header row
                        table.Header(header =>
                        {
                            foreach (var headerText in reportData.Data.Header)
                            {
                                header.Cell()
                                    .Background(Colors.Grey.Lighten2)
                                    .Padding(5)
                                    .Text(headerText)
                                    .FontSize(7)
                                    .Bold();
                            }
                        });

                        // Data rows - limit to first 20 for display
                        var rowsToShow = reportData.Data.Rows.Take(20);
                        foreach (var row in rowsToShow)
                        {
                            foreach (var cell in row)
                            {
                                table.Cell()
                                    .Border(1)
                                    .BorderColor(Colors.Grey.Lighten1)
                                    .Padding(3)
                                    .Text(FormatCellValue(cell))
                                    .FontSize(6);
                            }
                        }
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("Page ");
                        text.CurrentPageNumber();
                        text.Span(" of ");
                        text.TotalPages();
                    });
            });
        });

        document.GeneratePdf(outputPath);
    }

    private void AddTableRow(TableDescriptor table, string label, string value)
    {
        table.Cell()
            .Border(1)
            .BorderColor(Colors.Grey.Lighten1)
            .Padding(5)
            .Text(label)
            .Bold();

        table.Cell()
            .Border(1)
            .BorderColor(Colors.Grey.Lighten1)
            .Padding(5)
            .Text(value);
    }

    private string FormatDate(string dateIso)
    {
        if (DateTime.TryParse(dateIso, out DateTime date))
        {
            return date.ToString("dd/MM/yyyy HH:mm");
        }
        return dateIso;
    }

    private string FormatGpsPosition(Position position)
    {
        return $"{position.Lat:F4}°, {position.Lng:F4}°, {position.Alt:F0}m";
    }

    private string GetRowValue(List<object> row, int index)
    {
        if (index < row.Count)
        {
            return row[index]?.ToString() ?? "";
        }
        return "";
    }

    private string FormatCellValue(object cell)
    {
        if (cell == null)
            return "";

        if (cell is double d)
            return d.ToString("F2");

        return cell.ToString() ?? "";
    }
}
