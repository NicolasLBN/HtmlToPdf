#!/usr/bin/env node

/**
 * Standalone PDF generator that can be called from .NET
 * Usage: node generate-pdf-standalone.js <input-json> <output-pdf>
 */

import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Simplified PDF generation that doesn't depend on complex React/browser components
async function generatePdf(jsonPath, pdfPath) {
  try {
    // Read and parse JSON
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    let yPos = 20;
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTALLATION REPORT', 105, yPos, { align: 'center' });
    yPos += 15;

    // General Information
    doc.setFontSize(14);
    doc.text('General Information', 15, yPos);
    yPos += 10;

    const general = jsonData.parameters?.general || {};
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const generalInfo = [
      ['Project', general.projectName || ''],
      ['Section', general.sectionName || ''],
      ['Company', general.company || ''],
      ['Operator', general.operator || ''],
      ['Date', formatDate(general.startDate)],
      ['GPS', formatGPS(general.position)]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: generalInfo,
      theme: 'grid',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Machine Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Machine Information', 15, yPos);
    yPos += 10;

    const machine = jsonData.parameters?.machine || {};
    doc.setFont('helvetica', 'normal');
    
    const machineInfo = [
      ['Name', machine.name || ''],
      ['Serial Number', machine.machineSerialNumber || ''],
      ['Client SN', machine.clientSerialNumber || ''],
      ['Max Force', `${machine.maxForce || 0} N`],
      ['Lubricator', machine.lubricator ? 'Yes' : 'No'],
      ['Aftercooler', machine.aftercooler ? 'Yes' : 'No']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: machineInfo,
      theme: 'grid',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Duct Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Duct Information', 15, yPos);
    yPos += 10;

    const duct = jsonData.parameters?.duct || {};
    doc.setFont('helvetica', 'normal');
    
    const ductInfo = [
      ['Identification', duct.identification || ''],
      ['Installed In', duct.installedIn || ''],
      ['Supplier', duct.supplier || ''],
      ['Inner Layer', duct.innerLayer || ''],
      ['Temperature', `${duct.temperature || 0}°C`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: ductInfo,
      theme: 'grid',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Cable Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cable Information', 15, yPos);
    yPos += 10;

    const cable = jsonData.parameters?.cable || {};
    doc.setFont('helvetica', 'normal');
    
    const cableInfo = [
      ['Type', cable.type || ''],
      ['Diameter', `${cable.diameter || 0} mm`],
      ['Fiber Count', cable.fiberCount?.toString() || '0'],
      ['Supplier', cable.supplier || ''],
      ['Reel', cable.reel || '']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: cableInfo,
      theme: 'grid',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      },
      styles: { fontSize: 9 }
    });

    // Add page for data
    if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
      doc.addPage();
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recorded Data', 15, 20);
      
      // Prepare table data - limiting to reasonable page size for display
      // For production, consider pagination or separate full data export
      const maxRows = 100; // Show first 100 rows
      const dataRows = jsonData.data.slice(0, maxRows).map(row => [
        row.distance?.toFixed(1) || '',
        row.force?.toString() || '',
        row.blowing?.toFixed(1) || '',
        row.speed?.toFixed(1) || '',
        formatDuration(row.stamp),
        row.comment || ''
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Distance (m)', 'Force (N)', 'Pressure (bar)', 'Speed (m/min)', 'Time', 'Remarks']],
        body: dataRows,
        theme: 'striped',
        styles: { fontSize: 7 },
        headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' }
      });
      
      // Add note if data was truncated
      if (jsonData.data.length > maxRows) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Showing first ${maxRows} of ${jsonData.data.length} data points`, 15, doc.lastAutoTable.finalY + 10);
      }
    }

    // Save PDF
    const pdfBuffer = doc.output('arraybuffer');
    fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
    
    console.log(`PDF generated successfully: ${pdfPath}`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatGPS(position) {
  if (!position) return 'No fix';
  return `${position.lat?.toFixed(4)}°, ${position.lng?.toFixed(4)}°, ${position.alt?.toFixed(0) || 0}m`;
}

function formatDuration(timestamp) {
  if (!timestamp) return '00:00:00';
  const seconds = Math.floor(timestamp / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Main entry point
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('Usage: node generate-pdf-standalone.js <input-json-path> <output-pdf-path>');
  process.exit(1);
}

const [inputPath, outputPath] = args;

if (!fs.existsSync(inputPath)) {
  console.error(`Error: Input file not found: ${inputPath}`);
  process.exit(1);
}

generatePdf(inputPath, outputPath)
  .then(() => {
    console.log('Success!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error.message);
    process.exit(1);
  });
