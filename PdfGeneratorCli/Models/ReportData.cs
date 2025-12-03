using Newtonsoft.Json;

namespace PdfGeneratorCli.Models;

public class ReportData
{
    [JsonProperty("data")]
    public DataSection Data { get; set; } = new();

    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("parameters")]
    public Parameters Parameters { get; set; } = new();
}

public class DataSection
{
    [JsonProperty("header")]
    public List<string> Header { get; set; } = new();

    [JsonProperty("rows")]
    public List<List<object>> Rows { get; set; } = new();
}

public class Parameters
{
    [JsonProperty("general")]
    public GeneralParameters General { get; set; } = new();

    [JsonProperty("machine")]
    public MachineParameters Machine { get; set; } = new();

    [JsonProperty("duct")]
    public DuctParameters Duct { get; set; } = new();

    [JsonProperty("cable")]
    public CableParameters Cable { get; set; } = new();
}

public class GeneralParameters
{
    [JsonProperty("sectionName")]
    public string SectionName { get; set; } = string.Empty;

    [JsonProperty("company")]
    public string Company { get; set; } = string.Empty;

    [JsonProperty("position")]
    public Position Position { get; set; } = new();

    [JsonProperty("projectName")]
    public string ProjectName { get; set; } = string.Empty;

    [JsonProperty("startDate")]
    public string StartDate { get; set; } = string.Empty;

    [JsonProperty("operator")]
    public string Operator { get; set; } = string.Empty;
}

public class Position
{
    [JsonProperty("lng")]
    public double Lng { get; set; }

    [JsonProperty("alt")]
    public double Alt { get; set; }

    [JsonProperty("lat")]
    public double Lat { get; set; }
}

public class MachineParameters
{
    [JsonProperty("lubricator")]
    public bool Lubricator { get; set; }

    [JsonProperty("magneticClutch")]
    public bool MagneticClutch { get; set; }

    [JsonProperty("clientSerialNumber")]
    public string ClientSerialNumber { get; set; } = string.Empty;

    [JsonProperty("maxForce")]
    public double MaxForce { get; set; }

    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("aftercooler")]
    public bool Aftercooler { get; set; }

    [JsonProperty("maxPushForceAtStart")]
    public double MaxPushForceAtStart { get; set; }

    [JsonProperty("type")]
    public int Type { get; set; }

    [JsonProperty("lubricant")]
    public string Lubricant { get; set; } = string.Empty;

    [JsonProperty("machineSerialNumber")]
    public string MachineSerialNumber { get; set; } = string.Empty;

    [JsonProperty("compressor")]
    public string Compressor { get; set; } = string.Empty;
}

public class DuctParameters
{
    [JsonProperty("identification")]
    public string Identification { get; set; } = string.Empty;

    [JsonProperty("installedIn")]
    public string InstalledIn { get; set; } = string.Empty;

    [JsonProperty("configuration")]
    public string Configuration { get; set; } = string.Empty;

    [JsonProperty("supplier")]
    public string Supplier { get; set; } = string.Empty;

    [JsonProperty("innerLayer")]
    public string InnerLayer { get; set; } = string.Empty;

    [JsonProperty("temperature")]
    public double Temperature { get; set; }
}

public class CableParameters
{
    [JsonProperty("head")]
    public bool Head { get; set; }

    [JsonProperty("diameter")]
    public double Diameter { get; set; }

    [JsonProperty("supplier")]
    public string Supplier { get; set; } = string.Empty;

    [JsonProperty("fiberCount")]
    public int FiberCount { get; set; }

    [JsonProperty("type")]
    public string Type { get; set; } = string.Empty;

    [JsonProperty("category")]
    public string Category { get; set; } = string.Empty;

    [JsonProperty("reel")]
    public string Reel { get; set; } = string.Empty;
}
