# JavaScript PDF Generation

This directory contains the JavaScript-based PDF generation code that the .NET 8 application calls to generate PDFs with high fidelity to the original design.

## Setup

1. Make sure Node.js is installed (v14 or later recommended):
   ```bash
   node --version
   ```

2. Install dependencies:
   ```bash
   cd reports
   npm install
   ```

## Usage

### Standalone
You can run the PDF generator directly:
```bash
node generate-pdf-standalone.js <input-json> <output-pdf>
```

Example:
```bash
node generate-pdf-standalone.js ../sample.json ../output.pdf
```

### From .NET
The .NET application automatically calls this script via the `NodeJsPdfGeneratorService`.

## Dependencies

- **jspdf**: PDF generation library
- **jspdf-autotable**: Table plugin for jsPDF

These are automatically installed when you run `npm install`.

## How It Works

The `generate-pdf-standalone.js` script:
1. Reads the JSON input file
2. Parses the report data
3. Generates a PDF using jsPDF with:
   - General information table
   - Machine information table
   - Duct information table
   - Cable information table
   - Recorded data table (if data exists)
4. Saves the PDF to the specified output path

## Integration with .NET

The .NET application uses the `NodeJsPdfGeneratorService` which:
- Locates the Node.js executable
- Finds the JavaScript generation script
- Spawns a Node.js process to generate the PDF
- Captures output and errors for logging
- Returns success/failure to the calling code

This approach ensures that PDFs are generated with the same JavaScript libraries and logic as the original implementation, maintaining visual fidelity and compatibility.
