#!/usr/bin/env node

/**
 * Standalone PDF generator that can be called from .NET
 * Usage: node generate-pdf-standalone.js <input-json> <output-pdf>
 */

import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { drawLineBottom, drawLineLeft, drawLineRight } from './pdf/utils/table-drawing.js';

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

    const pageWidth = doc.internal.pageSize.width;
    const pageMargin = 15;
    const tableBorderColor = '#000000';
    const tableBorderWidth = 0.5;
    
    // Build metadata table body
    const general = jsonData.parameters?.general || {};
    const machine = jsonData.parameters?.machine || {};
    const duct = jsonData.parameters?.duct || {};
    const cable = jsonData.parameters?.cable || {};
    
    const metadataBody = [
      [
        { content: 'INSTALLATION REPORT', colSpan: 4, styles: { fontSize: 18, fontStyle: 'bold', halign: 'center', valign: 'middle' } }
      ],
      [
        { content: 'Project', styles: { fontStyle: 'bold' } },
        { content: general.projectName || '', colSpan: 2 },
        { content: `Date: ${formatDate(general.startDate)}` }
      ],
      [
        { content: 'Section', styles: { fontStyle: 'bold' } },
        { content: general.sectionName || '', colSpan: 3 }
      ],
      [
        { content: 'Company', styles: { fontStyle: 'bold' } },
        { content: general.company || '', colSpan: 2 },
        { content: `Operator: ${general.operator || ''}` }
      ],
      [
        { content: 'GPS', styles: { fontStyle: 'bold' } },
        { content: formatGPS(general.position), colSpan: 3 }
      ],
      [],
      [
        { content: 'DUCT', colSpan: 2, styles: { fillColor: '#cccccc', fontSize: 10, fontStyle: 'bold', halign: 'center' } },
        { content: 'CABLE', styles: { fillColor: '#cccccc', fontSize: 10, fontStyle: 'bold', halign: 'center' } },
        { content: 'MACHINE', styles: { fillColor: '#cccccc', fontSize: 10, fontStyle: 'bold', halign: 'center' } }
      ],
      [
        { content: `Supplier: ${duct.supplier || ''}`, colSpan: 2 },
        { content: `Supplier: ${cable.supplier || ''}` },
        { content: `Optijet (SN#${machine.machineSerialNumber || ''})` }
      ],
      [
        { content: `Type: ${duct.type || ''}`, colSpan: 2 },
        { content: `Type: ${cable.type || ''}` },
        { content: `Asset: ${machine.clientSerialNumber || ''}` }
      ],
      [
        { content: `Configuration: ${duct.configuration || ''}`, colSpan: 2 },
        { content: `Diameter: ${cable.diameter || 0} mm, Fibers: ${cable.fiberCount || 0}` },
        { content: `Lubricator: [${machine.lubricator ? 'X' : ' '}]` }
      ],
      [
        { content: `Color: ${duct.identification || ''}`, colSpan: 2 },
        { content: `Reel: ${cable.reel || ''}` },
        { content: `Lubricant: ${machine.lubricant || 'without'}` }
      ],
      [
        { content: `Inner Layer: ${duct.innerLayer || ''}`, colSpan: 2 },
        { content: `Installed In: ${duct.installedIn || ''}` },
        { content: `Compressor: ${machine.compressor || ''}` }
      ],
      [
        { content: `Temperature: ${duct.temperature || 0}°C`, colSpan: 2 },
        { content: `Cable Temp: ${cable.temperature || 0}°C` },
        { content: `Aftercooler: [${machine.aftercooler ? 'X' : ' '}]` }
      ],
      [
        { content: '', colSpan: 2 },
        { content: '' },
        { content: `Cable Head: [${cable.head ? 'X' : ' '}]` }
      ],
      [
        { content: 'SUMMARY', styles: { fillColor: '#cccccc', fontSize: 10, fontStyle: 'bold' } },
        { content: `Max Push Force: ${machine.maxForce || 0} N`, colSpan: 2, styles: { fillColor: '#ffffff' } },
        { content: '', styles: { fillColor: '#ffffff' } }
      ]
    ];

    // Apply metadata table styling similar to make-metadata-table.js
    autoTable(doc, {
      body: metadataBody,
      theme: 'plain',
      tableLineWidth: tableBorderWidth,
      tableLineColor: tableBorderColor,
      styles: {
        overflow: 'ellipsize',
        lineWidth: 0.1,
        lineColor: '#5c5c5c',
        cellPadding: {
          horizontal: 0.5,
          vertical: 1,
        },
        fontSize: 8,
        font: 'helvetica',
        textColor: '#000000',
      },
      margin: pageMargin,
      columnStyles: applyColumnStyles([2, 1, 3, 3], pageWidth - 2 * pageMargin),
      didDrawCell: (data) => {
        const row = data.row;
        const column = data.column;
        const doc = data.doc;

        // draw column borders for specific rows
        if (row.index >= 6 && row.index <= 13) {
          drawLineRight(doc, data.cell, tableBorderWidth, tableBorderColor);
          drawLineLeft(doc, data.cell, tableBorderWidth, tableBorderColor);
        }

        // draw row bottom borders
        if (row.index === 5 || row.index === 13) {
          drawLineBottom(doc, data.cell, tableBorderWidth * 2, tableBorderColor);
        }

        // draw more row bottom borders
        if (column.index === 3) {
          if (row.index === 10 || row.index === 12) {
            drawLineBottom(doc, data.cell, tableBorderWidth, tableBorderColor);
          }
        }
      }
    });

    // Add page for data
    if (jsonData.data && jsonData.data.rows && Array.isArray(jsonData.data.rows) && jsonData.data.rows.length > 0) {
      doc.addPage();
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Recorded Data', 15, 20);
      
      // Prepare table data using the data structure
      const maxRows = 100;
      const rows = jsonData.data.rows.slice(0, maxRows);
      const startTimestamp = rows[0] && rows[0][6] ? rows[0][6] : 0;
      
      const dataRows = rows.map(row => {
        const [type, distance, speed, force, blowing, temperature, stamp, comment] = row;
        return {
          distance: Number(distance).toFixed(1),
          force: String(force || '0'),
          blowing: Number(blowing).toFixed(1),
          speed: Number(speed).toFixed(1),
          time: formatDuration(stamp - startTimestamp),
          comment: comment || ''
        };
      });

      // Apply recorded data table styling similar to make-recorded-data-table.js
      autoTable(doc, {
        startY: 25,
        theme: 'plain',
        head: [
          {
            distance: { content: 'Length', styles: { fontStyle: 'bold', cellPadding: { top: 1 } } },
            force: { content: 'Pushing Force', styles: { fontStyle: 'bold', cellPadding: { top: 1 } } },
            blowing: { content: 'Duct Pressure', styles: { fontStyle: 'bold', cellPadding: { top: 1 } } },
            speed: { content: 'Speed', styles: { fontStyle: 'bold', cellPadding: { top: 1 } } },
            time: { content: 'Time Duration', styles: { fontStyle: 'bold', cellPadding: { top: 1 } } },
            comment: { content: 'Remarks', styles: { fontStyle: 'bold', cellPadding: { top: 1 } } }
          },
          {
            distance: '[m]',
            force: '[N]',
            blowing: '[bar]',
            speed: '[m/min]',
            time: '[hh:mm:ss]',
            comment: ''
          }
        ],
        headStyles: {
          minCellHeight: 4,
          fillColor: '#DDDDDD',
          textColor: '#000000',
          halign: 'center',
          fontStyle: 'normal',
        },
        tableLineWidth: 0.25,
        tableLineColor: '#000000',
        body: dataRows,
        styles: {
          overflow: 'ellipsize',
          minCellHeight: 4,
          cellPadding: {
            horizontal: 2,
            vertical: 0.5,
          },
          fontSize: 7,
          textColor: '#000000',
          fillColor: '#ffffff',
        },
        columnStyles: {
          distance: {
            halign: 'right',
            cellWidth: 20,
          },
          force: {
            halign: 'right',
            cellWidth: 20,
          },
          blowing: {
            halign: 'right',
            cellWidth: 20,
          },
          speed: {
            halign: 'right',
            cellWidth: 20,
          },
          time: {
            halign: 'center',
            cellWidth: 20,
          },
          comment: {
            halign: 'left',
            cellWidth: 'auto',
          },
        },
        didDrawCell: (data) => {
          // draw border bottom of the second header row
          if (data.section === 'head' && data.row.index === 1) {
            drawLineBottom(data.doc, data.cell, 0.1, '#232323');
          }
          drawLineRight(data.doc, data.cell, 0.05, '#232323');
          drawLineLeft(data.doc, data.cell, 0.05, '#232323');
        }
      });
      
      // Add note if data was truncated
      if (jsonData.data.rows.length > maxRows) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Showing first ${maxRows} of ${jsonData.data.rows.length} data points`, 15, doc.lastAutoTable.finalY + 10);
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

/**
 * There is no config to specify column widths as their ratios,
 * so we need to calculate them manually
 *
 * @param ratios e.g. [2,1,3,3] means:
 * - ratios[0] is twice as big as ratios[1]
 * - ratios[2] and ratios[3] are the same size
 * - ratios[2] is the same size as ratios[0] + ratios[1]
 */
function applyColumnStyles(ratios, tableWidth) {
  const styles = {};
  const ratioSum = ratios.reduce((acc, curr) => acc + curr, 0);
  
  ratios.forEach((ratio, index) => {
    styles[index] = {
      cellWidth: tableWidth * (ratio / ratioSum),
    };
  });
  
  return styles;
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
