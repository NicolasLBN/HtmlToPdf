import { ImageCellRenderer } from '../custom-cell-renderers/image-cell-renderer';
import { LinkCellRenderer } from '../custom-cell-renderers/link-cell-renderer';
import { drawLineBottom, drawLineLeft, drawLineRight } from '../utils/table-drawing';

export function makeMetadataTable(body, pageWidth) {
  const cellRenderers = [
    new ImageCellRenderer(),
    new LinkCellRenderer(),
  ];
  const callsToUpdate = [];

  const tableBorderColor = '#000000';
  const tableBorderWidth = 0.5;
  const pageMargin = 15;

  return {
    body: body,
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
    columnStyles: applyColumnStyles(
        [2, 1, 3, 3],
        pageWidth - 2 * pageMargin,
    ),
    didParseCell: data => {
      cellRenderers.forEach(renderer => {
        if (renderer.canHandleCell(data.cell)) {
          callsToUpdate.push(renderer.markToRender(data));
        }
      });
    },
    didDrawPage: () => {
      callsToUpdate.forEach(call => call());
    },
    didDrawCell: data => {
      const row = data.row;
      const column = data.column;
      const doc = data.doc;

      // draw column borders
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
    },
  };
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
