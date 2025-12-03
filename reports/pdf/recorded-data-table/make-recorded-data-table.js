import { drawLineBottom, drawLineLeft, drawLineRight } from '../utils/table-drawing';

/**
 * A round number, so that when the `jspdf-autotable` adds them
 * we won't loose a precision due to IEEE 754 standard.
 */
const cellHeight = 4;

export function makeRecordedDataTable(data, t, startY) {
  return {
    startY: startY,
    theme: 'plain',
    head: [
      {
        distance: headerPrimaryCell(t('recorded_data.columns.length.header_cell')),
        force: headerPrimaryCell(t('recorded_data.columns.pushing_force.header_cell')),
        blowing: headerPrimaryCell(t('recorded_data.columns.duct_pressure.header_cell')),
        speed: headerPrimaryCell(t('recorded_data.columns.speed.header_cell')),
        time: headerPrimaryCell(t('recorded_data.columns.time_duration.header_cell')),
        comment: headerPrimaryCell(t('recorded_data.columns.remarks.header_cell')),
      },
      {
        distance: headerSecondaryCell('[m]'),
        force: headerSecondaryCell('[N]'),
        blowing: headerSecondaryCell('[bar]'),
        speed: headerSecondaryCell('[m/min]'),
        time: headerSecondaryCell('[hh:mm:ss]'),
        comment: headerSecondaryCell(''),
      },
    ],
    headStyles: {
      minCellHeight: cellHeight,
      fillColor: '#DDDDDD',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'normal',
    },
    tableLineWidth: 0.25,
    tableLineColor: '#000000',
    body: data,
    styles: {
      overflow: 'ellipsize',
      minCellHeight: cellHeight,
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
    /**
     * We need to manually draw the borders, because the default ones
     * have a very tiny gaps between the cell, which look not so good.
     */
    didDrawCell: (data) => {
      // draw border bottom of the second header row
      if (data.section === 'head' && data.row.index === 1) {
        drawLineBottom(data.doc, data.cell, 0.1, '#232323');
      }
      drawLineRight(data.doc, data.cell, 0.05, '#232323');
      drawLineLeft(data.doc, data.cell, 0.05, '#232323');
    },
  };
}

function headerPrimaryCell(content) {
  return {
    content: content,
    styles: {
      fontStyle: 'bold',
      cellPadding: {
        top: 1,
      },
    },
  };
}

function headerSecondaryCell(content) {
  return content;
}
