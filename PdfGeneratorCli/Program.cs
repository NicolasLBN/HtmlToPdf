using System.Diagnostics;

Console.WriteLine("HTML to PDF Generator (using Node.js)");
Console.WriteLine("======================================\n");

string jsonFilePath = "../01ebdf62-b7e5-19e8-8000-00142dc07b4a--c10_2025-09-02_13-01_.json";
string outputPath = "../generated_report.pdf";

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

// Find Node.js executable
string nodeExecutable = FindNodeExecutable();
if (string.IsNullOrEmpty(nodeExecutable))
{
    Console.WriteLine("Error: Node.js not found. Please install Node.js.");
    Environment.Exit(1);
}

// Get the Node.js script path
var scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "reports", "generate-pdf-standalone.js");
scriptPath = Path.GetFullPath(scriptPath);

if (!File.Exists(scriptPath))
{
    Console.WriteLine($"Error: Node.js script not found at: {scriptPath}");
    Environment.Exit(1);
}

if (!File.Exists(jsonFilePath))
{
    Console.WriteLine($"Error: Input JSON file not found: {jsonFilePath}");
    Environment.Exit(1);
}

try
{
    Console.WriteLine("Generating PDF using Node.js...");
    
    var startInfo = new ProcessStartInfo
    {
        FileName = nodeExecutable,
        Arguments = $"\"{scriptPath}\" \"{jsonFilePath}\" \"{outputPath}\"",
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        UseShellExecute = false,
        CreateNoWindow = true,
        WorkingDirectory = Path.GetDirectoryName(scriptPath)
    };

    using var process = new Process { StartInfo = startInfo };
    
    process.OutputDataReceived += (sender, e) =>
    {
        if (!string.IsNullOrEmpty(e.Data))
        {
            Console.WriteLine($"[Node.js] {e.Data}");
        }
    };

    process.ErrorDataReceived += (sender, e) =>
    {
        if (!string.IsNullOrEmpty(e.Data))
        {
            Console.WriteLine($"[Error] {e.Data}");
        }
    };

    process.Start();
    process.BeginOutputReadLine();
    process.BeginErrorReadLine();
    process.WaitForExit();

    if (process.ExitCode == 0)
    {
        Console.WriteLine($"\nSuccess! PDF generated at: {outputPath}");
    }
    else
    {
        Console.WriteLine($"\nError: PDF generation failed with exit code {process.ExitCode}");
        Environment.Exit(1);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"\nError: {ex.Message}");
    Environment.Exit(1);
}

static string FindNodeExecutable()
{
    var possiblePaths = new[]
    {
        "node",
        "/usr/local/bin/node",
        "/usr/bin/node",
        "C:\\Program Files\\nodejs\\node.exe",
        "C:\\Program Files (x86)\\nodejs\\node.exe"
    };

    foreach (var path in possiblePaths)
    {
        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = path,
                Arguments = "--version",
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(startInfo);
            if (process != null)
            {
                process.WaitForExit(1000);
                if (process.ExitCode == 0)
                {
                    return path;
                }
            }
        }
        catch
        {
            // Continue trying other paths
        }
    }

    return string.Empty;
}
