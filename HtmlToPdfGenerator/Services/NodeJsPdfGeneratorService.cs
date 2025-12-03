using System.Diagnostics;

namespace HtmlToPdfGenerator.Services;

/// <summary>
/// Service that generates PDFs by calling the Node.js PDF generation script.
/// This provides better fidelity to the original JavaScript implementation.
/// </summary>
public class NodeJsPdfGeneratorService
{
    // Configuration: Path to Node.js script relative to project root
    private const string NodeScriptRelativePath = "../reports/generate-pdf-standalone.js";
    
    private readonly ILogger<NodeJsPdfGeneratorService> _logger;
    private readonly string _nodeScriptPath;
    private readonly string _nodeExecutable;

    public NodeJsPdfGeneratorService(ILogger<NodeJsPdfGeneratorService> logger)
    {
        _logger = logger;
        
        // Get the path to the Node.js script relative to the project
        var projectRoot = Directory.GetCurrentDirectory();
        _nodeScriptPath = Path.Combine(projectRoot, NodeScriptRelativePath);
        
        // Try to find node executable
        _nodeExecutable = FindNodeExecutable();
        
        _logger.LogInformation("NodeJsPdfGeneratorService initialized");
        _logger.LogInformation("Node executable: {NodeExe}", _nodeExecutable);
        _logger.LogInformation("Script path: {ScriptPath}", _nodeScriptPath);
    }

    public async Task<bool> GeneratePdfAsync(string jsonInputPath, string pdfOutputPath)
    {
        if (!File.Exists(jsonInputPath))
        {
            throw new FileNotFoundException($"Input JSON file not found: {jsonInputPath}");
        }

        if (string.IsNullOrEmpty(_nodeExecutable))
        {
            throw new InvalidOperationException("Node.js executable not found. Please ensure Node.js is installed and in PATH.");
        }

        if (!File.Exists(_nodeScriptPath))
        {
            throw new FileNotFoundException($"Node.js script not found: {_nodeScriptPath}");
        }

        try
        {
            _logger.LogInformation("Generating PDF using Node.js...");
            _logger.LogInformation("Input: {Input}", jsonInputPath);
            _logger.LogInformation("Output: {Output}", pdfOutputPath);

            var startInfo = new ProcessStartInfo
            {
                FileName = _nodeExecutable,
                Arguments = $"\"{_nodeScriptPath}\" \"{jsonInputPath}\" \"{pdfOutputPath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                WorkingDirectory = Path.GetDirectoryName(_nodeScriptPath)
            };

            using var process = new Process { StartInfo = startInfo };
            
            var outputBuilder = new System.Text.StringBuilder();
            var errorBuilder = new System.Text.StringBuilder();

            process.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    outputBuilder.AppendLine(e.Data);
                    _logger.LogInformation("Node.js: {Output}", e.Data);
                }
            };

            process.ErrorDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    errorBuilder.AppendLine(e.Data);
                    _logger.LogError("Node.js Error: {Error}", e.Data);
                }
            };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            if (process.ExitCode == 0)
            {
                _logger.LogInformation("PDF generated successfully");
                return true;
            }
            else
            {
                var errorMessage = errorBuilder.ToString();
                _logger.LogError("Node.js process failed with exit code {ExitCode}. Error: {Error}", 
                    process.ExitCode, errorMessage);
                throw new InvalidOperationException(
                    $"PDF generation failed. Exit code: {process.ExitCode}. Error: {errorMessage}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF with Node.js");
            throw;
        }
    }

    private string FindNodeExecutable()
    {
        // Try common locations
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
                    // Increased timeout for slower systems
                    process.WaitForExit(5000);
                    if (process.ExitCode == 0)
                    {
                        _logger.LogInformation("Found Node.js at: {Path}", path);
                        return path;
                    }
                }
            }
            catch
            {
                // Continue trying other paths
            }
        }

        _logger.LogWarning("Node.js executable not found in common locations");
        return string.Empty;
    }
}
