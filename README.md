# HTML to PDF Generator

A .NET Razor-based PDF generation tool that converts JSON data into professional PDF reports.

## Project Structure

- **HtmlToPdfGenerator** - ASP.NET Core Razor Pages web application for PDF generation
- **PdfGeneratorCli** - Console application for command-line PDF generation

## Features

- Reads JSON input files containing report data
- Generates multi-page PDF reports with:
  - General information (project, section, company, operator, date, GPS)
  - Machine information (name, serial numbers, max force, lubricator, etc.)
  - Duct information (identification, installation, supplier, temperature)
  - Cable information (type, diameter, fiber count, reel)
  - Recorded data table with all measurement points

## Prerequisites

- .NET 10.0 SDK or later
- QuestPDF library (automatically installed via NuGet)
- Newtonsoft.Json library (automatically installed via NuGet)

## Usage

### Using the Web Application

1. Build and run the web application:
   ```bash
   cd HtmlToPdfGenerator
   dotnet run
   ```

2. Open your browser to the displayed URL (typically `https://localhost:5001`)

3. Enter the path to your JSON file and desired output PDF path

4. Click "Generate PDF"

### Using the Command-Line Tool

1. Build the CLI project:
   ```bash
   cd PdfGeneratorCli
   dotnet build
   ```

2. Run with default paths:
   ```bash
   dotnet run
   ```

3. Or specify custom paths:
   ```bash
   dotnet run -- /path/to/input.json /path/to/output.pdf
   ```

## Example

The repository includes a sample JSON file:
- `01ebdf62-b7e5-19e8-8000-00142dc07b4a--c10_2025-09-02_13-01_.json`

And a reference PDF showing expected output:
- `test_2.0.2_iot_report_test_2022-05-04_13-04_banc_test (1).pdf`

To generate a PDF from the sample JSON:
```bash
cd PdfGeneratorCli
dotnet run
```

This will create `generated_report.pdf` in the repository root.

## JSON Data Structure

The JSON input file should contain:
- `id`: Unique identifier for the report
- `data`: Section with `header` and `rows` arrays containing measurement data
- `parameters`: Object containing:
  - `general`: Project information (name, section, company, operator, date, GPS position)
  - `machine`: Machine specifications (name, serial numbers, max force, features)
  - `duct`: Duct specifications (identification, supplier, inner layer, temperature)
  - `cable`: Cable specifications (type, diameter, fiber count, reel)

## Dependencies

- **QuestPDF** (2025.7.4) - Modern PDF generation library
- **Newtonsoft.Json** (13.0.4) - JSON parsing and serialization

## License

QuestPDF Community License is used for this project.

## Development

Based on the JavaScript implementation in the `reports` directory, this .NET version provides equivalent functionality with improved type safety and performance.
