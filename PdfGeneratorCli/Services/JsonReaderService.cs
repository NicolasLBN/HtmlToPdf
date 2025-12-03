using Newtonsoft.Json;
using PdfGeneratorCli.Models;

namespace PdfGeneratorCli.Services;

public class JsonReaderService
{
    public ReportData? ReadJsonFile(string filePath)
    {
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"JSON file not found: {filePath}");
        }

        var jsonContent = File.ReadAllText(filePath);
        return JsonConvert.DeserializeObject<ReportData>(jsonContent);
    }
}
