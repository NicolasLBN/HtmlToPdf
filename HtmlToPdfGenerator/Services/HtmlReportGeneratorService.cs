using HtmlToPdfGenerator.Models;
using System.Text;

namespace HtmlToPdfGenerator.Services;

/// <summary>
/// Service that generates HTML reports from JSON data.
/// The HTML is styled to match the original PDF layout as closely as possible.
/// </summary>
public class HtmlReportGeneratorService
{
    public string GenerateHtmlReport(ReportData reportData)
    {
        var html = new StringBuilder();
        
        html.AppendLine("<!DOCTYPE html>");
        html.AppendLine("<html lang='en'>");
        html.AppendLine("<head>");
        html.AppendLine("    <meta charset='UTF-8'>");
        html.AppendLine("    <meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.AppendLine("    <title>Installation Report</title>");
        html.AppendLine("    <style>");
        html.AppendLine(GetStyles());
        html.AppendLine("    </style>");
        html.AppendLine("</head>");
        html.AppendLine("<body>");
        
        // Main metadata table
        html.AppendLine("    <table class='metadata-table'>");
        html.AppendLine("        <tr>");
        html.AppendLine("            <td colspan='4' class='title'>INSTALLATION REPORT</td>");
        html.AppendLine("        </tr>");
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td class='label'>Project</td>");
        html.AppendLine($"            <td colspan='2'>{EscapeHtml(reportData.Parameters.General.ProjectName)}</td>");
        html.AppendLine($"            <td>Date: {FormatDate(reportData.Parameters.General.StartDate)}</td>");
        html.AppendLine("        </tr>");
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td class='label'>Section</td>");
        html.AppendLine($"            <td colspan='3'>{EscapeHtml(reportData.Parameters.General.SectionName)}</td>");
        html.AppendLine("        </tr>");
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td class='label'>Company</td>");
        html.AppendLine($"            <td colspan='2'>{EscapeHtml(reportData.Parameters.General.Company)}</td>");
        html.AppendLine($"            <td>Operator: {EscapeHtml(reportData.Parameters.General.Operator)}</td>");
        html.AppendLine("        </tr>");
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td class='label'>GPS</td>");
        html.AppendLine($"            <td colspan='3'>{FormatGPS(reportData.Parameters.General.Position)}</td>");
        html.AppendLine("        </tr>");
        html.AppendLine("        <tr class='separator'>");
        html.AppendLine("            <td colspan='4'>&nbsp;</td>");
        html.AppendLine("        </tr>");
        
        // Section headers
        html.AppendLine("        <tr>");
        html.AppendLine("            <td colspan='2' class='section-header'>DUCT</td>");
        html.AppendLine("            <td class='section-header'>CABLE</td>");
        html.AppendLine("            <td class='section-header'>MACHINE</td>");
        html.AppendLine("        </tr>");
        
        // Supplier row
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td colspan='2'>Supplier: {EscapeHtml(reportData.Parameters.Duct.Supplier)}</td>");
        html.AppendLine($"            <td>Supplier: {EscapeHtml(reportData.Parameters.Cable.Supplier)}</td>");
        html.AppendLine($"            <td>Optijet (SN#{EscapeHtml(reportData.Parameters.Machine.MachineSerialNumber)})</td>");
        html.AppendLine("        </tr>");
        
        // Type/Asset row
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td colspan='2'>Type: {EscapeHtml(reportData.Parameters.Duct.Configuration)}</td>");
        html.AppendLine($"            <td>Type: {EscapeHtml(reportData.Parameters.Cable.Type)}</td>");
        html.AppendLine($"            <td>Asset: {EscapeHtml(reportData.Parameters.Machine.ClientSerialNumber)}</td>");
        html.AppendLine("        </tr>");
        
        // Configuration/Diameter/Lubricator row
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td colspan='2'>Configuration: {EscapeHtml(reportData.Parameters.Duct.Configuration)}</td>");
        html.AppendLine($"            <td>Diameter: {reportData.Parameters.Cable.Diameter} mm, Fibers: {reportData.Parameters.Cable.FiberCount}</td>");
        html.AppendLine($"            <td>Lubricator: [{(reportData.Parameters.Machine.Lubricator ? "X" : " ")}]</td>");
        html.AppendLine("        </tr>");
        
        // Color/Reel/Lubricant row
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td colspan='2'>Color: {EscapeHtml(reportData.Parameters.Duct.Identification)}</td>");
        html.AppendLine($"            <td>Reel: {EscapeHtml(reportData.Parameters.Cable.Reel)}</td>");
        html.AppendLine($"            <td>Lubricant: {EscapeHtml(reportData.Parameters.Machine.Lubricant)}</td>");
        html.AppendLine("        </tr>");
        
        // Inner Layer/Installed In/Compressor row
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td colspan='2'>Inner Layer: {EscapeHtml(reportData.Parameters.Duct.InnerLayer)}</td>");
        html.AppendLine($"            <td>Installed In: {EscapeHtml(reportData.Parameters.Duct.InstalledIn)}</td>");
        html.AppendLine($"            <td>Compressor: {EscapeHtml(reportData.Parameters.Machine.Compressor)}</td>");
        html.AppendLine("        </tr>");
        
        // Temperature/Aftercooler row
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td colspan='2'>Temperature: {reportData.Parameters.Duct.Temperature}°C</td>");
        html.AppendLine($"            <td>Cable Temp: 0°C</td>");
        html.AppendLine($"            <td>Aftercooler: [{(reportData.Parameters.Machine.Aftercooler ? "X" : " ")}]</td>");
        html.AppendLine("        </tr>");
        
        // Empty/Cable Head row
        html.AppendLine("        <tr>");
        html.AppendLine($"            <td colspan='2'>&nbsp;</td>");
        html.AppendLine($"            <td>&nbsp;</td>");
        html.AppendLine($"            <td>Cable Head: [{(reportData.Parameters.Cable.Head ? "X" : " ")}]</td>");
        html.AppendLine("        </tr>");
        
        // Summary row
        html.AppendLine("        <tr class='summary-row'>");
        html.AppendLine("            <td class='section-header'>SUMMARY</td>");
        html.AppendLine($"            <td colspan='3'>Max Push Force: {reportData.Parameters.Machine.MaxForce} N</td>");
        html.AppendLine("        </tr>");
        
        html.AppendLine("    </table>");
        
        // Recorded data table
        if (reportData.Data?.Rows?.Count > 0)
        {
            html.AppendLine("    <div class='page-break'></div>");
            html.AppendLine("    <h2>Recorded Data</h2>");
            html.AppendLine("    <table class='data-table'>");
            html.AppendLine("        <thead>");
            html.AppendLine("            <tr class='header-row'>");
            html.AppendLine("                <th>Length<br/>[m]</th>");
            html.AppendLine("                <th>Pushing Force<br/>[N]</th>");
            html.AppendLine("                <th>Duct Pressure<br/>[bar]</th>");
            html.AppendLine("                <th>Speed<br/>[m/min]</th>");
            html.AppendLine("                <th>Time Duration<br/>[hh:mm:ss]</th>");
            html.AppendLine("                <th>Remarks</th>");
            html.AppendLine("            </tr>");
            html.AppendLine("        </thead>");
            html.AppendLine("        <tbody>");
            
            double startTimestamp = 0;
            if (reportData.Data.Rows.Count > 0 && reportData.Data.Rows[0].Count > 6)
            {
                try
                {
                    startTimestamp = Convert.ToDouble(reportData.Data.Rows[0][6]);
                }
                catch
                {
                    startTimestamp = 0;
                }
            }
            
            var maxRows = Math.Min(100, reportData.Data.Rows.Count);
            for (int i = 0; i < maxRows; i++)
            {
                var row = reportData.Data.Rows[i];
                if (row.Count >= 8)
                {
                    try
                    {
                        var distance = Convert.ToDouble(row[1]);
                        var speed = Convert.ToDouble(row[2]);
                        var force = Convert.ToDouble(row[3]);
                        var blowing = Convert.ToDouble(row[4]);
                        var stamp = Convert.ToDouble(row[6]);
                        var comment = row[7]?.ToString() ?? "";
                    
                        html.AppendLine("            <tr>");
                        html.AppendLine($"                <td>{distance:F1}</td>");
                        html.AppendLine($"                <td>{force:F0}</td>");
                        html.AppendLine($"                <td>{blowing:F1}</td>");
                        html.AppendLine($"                <td>{speed:F1}</td>");
                        html.AppendLine($"                <td>{FormatDuration((int)(stamp - startTimestamp))}</td>");
                        html.AppendLine($"                <td>{EscapeHtml(comment)}</td>");
                        html.AppendLine("            </tr>");
                    }
                    catch
                    {
                        // Skip rows with invalid data
                        continue;
                    }
                }
            }
            
            html.AppendLine("        </tbody>");
            html.AppendLine("    </table>");
        }
        
        html.AppendLine("</body>");
        html.AppendLine("</html>");
        
        return html.ToString();
    }
    
    private string GetStyles()
    {
        return @"
            body {
                font-family: 'Helvetica', Arial, sans-serif;
                font-size: 8pt;
                margin: 15mm;
                color: #000000;
            }
            
            .metadata-table {
                width: 100%;
                border-collapse: collapse;
                border: 0.5pt solid #000000;
                margin-bottom: 20px;
            }
            
            .metadata-table td {
                border: 0.1pt solid #5c5c5c;
                padding: 1mm 0.5mm;
                font-size: 8pt;
            }
            
            .metadata-table .title {
                text-align: center;
                font-size: 18pt;
                font-weight: bold;
                padding: 5mm;
            }
            
            .metadata-table .label {
                font-weight: bold;
            }
            
            .metadata-table .separator {
                border: none;
            }
            
            .metadata-table .separator td {
                border: none;
                border-bottom: 1pt solid #000000;
            }
            
            .metadata-table .section-header {
                background-color: #cccccc;
                font-weight: bold;
                text-align: center;
                font-size: 10pt;
            }
            
            .metadata-table tr:nth-child(6) {
                border-bottom: 1pt solid #000000;
            }
            
            .metadata-table tr:nth-child(14) {
                border-bottom: 1pt solid #000000;
            }
            
            .metadata-table .summary-row {
                border-top: 1pt solid #000000;
            }
            
            .page-break {
                page-break-after: always;
            }
            
            h2 {
                font-size: 10pt;
                font-weight: normal;
                margin-top: 5mm;
                margin-bottom: 3mm;
            }
            
            .data-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 8pt;
            }
            
            .data-table thead {
                background-color: #f0f0f0;
            }
            
            .data-table th {
                border: 0.5pt solid #000000;
                padding: 2mm 1mm;
                text-align: center;
                font-weight: bold;
                font-size: 7pt;
                line-height: 1.2;
            }
            
            .data-table td {
                border: 0.5pt solid #cccccc;
                padding: 1mm;
                text-align: center;
                font-size: 7pt;
            }
            
            .data-table tbody tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            
            @media print {
                body {
                    margin: 15mm;
                }
                .page-break {
                    page-break-after: always;
                }
            }
        ";
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
    
    private string EscapeHtml(string text)
    {
        if (string.IsNullOrEmpty(text))
            return string.Empty;
            
        return text
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;")
            .Replace("'", "&#39;");
    }
}
