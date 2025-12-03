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

- .NET 8.0 SDK or later
- Node.js (v14 or later) - required for PDF generation
- QuestPDF library (automatically installed via NuGet)
- Newtonsoft.Json library (automatically installed via NuGet)

## Setup

### 1. Install Node.js Dependencies

Before running the .NET application, install the JavaScript dependencies:

```bash
cd reports
npm install
cd ..
```

## Usage

### Using the Web Application

1. Build and run the web application:
   ```bash
   cd HtmlToPdfGenerator
   dotnet run
   ```

2. Open your browser to the displayed URL (typically `https://localhost:5001` or `http://localhost:5000`)

3. Enter the path to your JSON file and desired output PDF path

4. Click "Generate PDF"

The application will use the JavaScript PDF generation script to create a PDF that matches the original design.

### Using the Command-Line Tool

1. Run with default paths:
   ```bash
   cd PdfGeneratorCli
   dotnet run
   ```

2. Or specify custom paths:
   ```bash
   dotnet run -- /path/to/input.json /path/to/output.pdf
   ```

The CLI tool calls the Node.js script directly for PDF generation.

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

### .NET
- **QuestPDF** (2025.7.4) - Modern PDF generation library (fallback option)
- **Newtonsoft.Json** (13.0.4) - JSON parsing and serialization

### Node.js
- **jspdf** (^3.0.4) - JavaScript PDF generation library
- **jspdf-autotable** (^5.0.2) - Table plugin for jsPDF

## License

QuestPDF Community License is used for this project.

## Architecture

The .NET 8 application integrates with the JavaScript PDF generation code in the `reports` directory to ensure the generated PDFs match the original design as closely as possible. 

### How It Works

1. The .NET application (`HtmlToPdfGenerator` or `PdfGeneratorCli`) receives a request to generate a PDF
2. It calls the `NodeJsPdfGeneratorService` which spawns a Node.js process
3. The Node.js process runs `generate-pdf-standalone.js` with the input JSON and output paths
4. The JavaScript code uses `jspdf` and `jspdf-autotable` to generate the PDF
5. The PDF is saved to the specified location
6. The .NET application receives the result and notifies the user

This hybrid approach combines:
- **.NET's strengths**: Strong typing, dependency injection, web application framework
- **JavaScript's strengths**: Direct use of the existing PDF generation code for maximum fidelity

## Development

The JavaScript implementation in the `reports` directory is the source of truth for PDF generation. The .NET application acts as a wrapper and provides a user-friendly interface for generating PDFs.
