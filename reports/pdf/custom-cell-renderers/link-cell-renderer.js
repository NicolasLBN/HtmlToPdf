const KEY_NAME = '__link__';

export class LinkCellRenderer {

  static markForFutureRendering(url, type) {
    return `${KEY_NAME}\n${url}\n${type}`;
  }

  canHandleCell(cell) {
    return cell.text[0] === KEY_NAME;
  }

  markToRender(data) {
    const url = data.cell.text[1];
    const type = data.cell.text[2];
    data.cell.text = [];

    return () => {
      this.drawLink(data.doc, data.cell, url, type);
    };
  }

  drawLink(doc, cell, url, type) {
    const color = '#0000ff';
    doc.setTextColor(color);
    doc.setFontSize(cell.styles.fontSize);

    const marginLeft = (cell.styles.cellPadding).left;
    const marginTop = (cell.styles.cellPadding).top;
    const drawXStart = cell.x + marginLeft;

    const drawYOffset = doc.getLineHeight() / doc.internal.scaleFactor;
    const drawYStart = cell.y + drawYOffset + marginTop;

    const width = doc.textWithLink(
        url,
        drawXStart,
        drawYStart,
        { url: type === 'MAIL' ? `mailto:${url}` : url },
    );

    doc.setDrawColor(color);
    doc.setLineWidth(0.15);
    const lineDrawYOffset = drawYOffset * 0.2;
    doc.line(drawXStart, drawYStart + lineDrawYOffset, drawXStart + width, drawYStart + lineDrawYOffset);
  }

}
