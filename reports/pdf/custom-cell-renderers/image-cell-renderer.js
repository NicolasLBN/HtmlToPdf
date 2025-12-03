const KEY_NAME = '__img__';

export class ImageCellRenderer {

  static markForFutureRendering(src, width, height) {
    return `${KEY_NAME}\n${src}\n${width}\n${height}`;
  }

  canHandleCell(cell) {
    return cell.text[0] === KEY_NAME;
  }

  markToRender(data) {
    const src = data.cell.text[1];
    const width = Number(data.cell.text[2]);
    const height = Number(data.cell.text[3]);
    if (Number.isNaN(width) || Number.isNaN(height)) {
      throw Error(`width and height must be valid numbers, but are: {width: ${width}, height: ${height}}`)
    }
    data.cell.text = [];

    return () => {
      this.drawCenteredImage(data.doc, src, width, height, data.cell)
    }
  }

  drawCenteredImage(doc, src, imgWidthPx, imgHeightPx, cell) {
    const pixelRatio = doc.internal.scaleFactor;
    const imgWidthPt = imgWidthPx / pixelRatio;
    const imgHeightPt = imgHeightPx / pixelRatio;

    const verticalPaddingPt = 4 / pixelRatio
    const availableWidth = cell.width - verticalPaddingPt * 2;
    const availableHeight = cell.height - verticalPaddingPt * 2;
    const heightDecreaseRatio = imgHeightPt / availableHeight;

    let renderedImageWidth = imgWidthPt / heightDecreaseRatio;
    let renderedImageHeight = imgHeightPt / heightDecreaseRatio;

    /**
     * Need to adjust the image sizing if the rendered width is greater the the cell size.
     * The adjustment need to be applied to both height and width to preserve the size ratio
     */
    if (renderedImageWidth > availableWidth) {
      const widthDecreaseRatio = availableWidth / renderedImageWidth;
      renderedImageWidth *= widthDecreaseRatio;
      // Some IDE may highlight this line as error, but it is in fact correct
      renderedImageHeight *= widthDecreaseRatio;
    }

    doc.addImage({
      imageData: src,
      x: cell.x + (cell.width - renderedImageWidth) / 2,
      y: cell.y + (cell.height - renderedImageHeight) / 2,
      width: renderedImageWidth,
      height: renderedImageHeight,
    });
  }

}
