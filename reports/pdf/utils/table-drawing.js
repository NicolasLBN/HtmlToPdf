export function drawLineBottom(doc, cell, width, color) {
  doc.setLineWidth(width)
  doc.setDrawColor(color)
  doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height, 'S')
}


/**
 * `jspdf-autotable` seems to have a bug, where
 * a vertical border line for a cell has some incorrect coordinates,
 * which results in borders of 2 neighbouring cells from 2 rows
 * don't seem to touch each other.
 *
 * This constant makes sure we start drawing the border slightly before
 * and end drawing slightly after just to make sure borders visually touch each other
 */
const c = 0.05;

export function drawLineRight(doc, cell, width, color) {
  doc.setLineWidth(width)
  doc.setDrawColor(color)
  doc.line(cell.x + cell.width, cell.y - c, cell.x + cell.width, cell.y + cell.height + c, 'S')
}

export function drawLineLeft(doc, cell, width, color) {
  doc.setLineWidth(width)
  doc.setDrawColor(color)
  doc.line(cell.x, cell.y - c, cell.x, cell.y + cell.height + c, 'S')
}
