import Canvg from 'canvg';
import { ImageOptions } from 'jspdf';

export async function svgsToCanvas(svgs, heightOffset) {
  // the plot is 2160*1080px vs an A4 pdf sheet at 300DPI is 2550*3300px
  const canvasWidth = 720 * 3
  const canvasHeight = 360 * 3
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // Avoid Black background: https://github.com/canvg/canvg/issues/324
  const ctx = canvas.getContext('2d')
  if (ctx === null) {
    throw Error("Cannot create canvas context");
  }
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  const ignoreClear = true

  const canvgOptions = {
    ignoreDimensions: true,
    ignoreClear,
    scaleWidth: canvasWidth,
    scaleHeight: canvasHeight,
  }

  const renderings = await Promise.all(svgs.map(svg => Canvg.from(ctx, svg, canvgOptions)))
  renderings.forEach(rendering => rendering.start())

  return {
    imageData: canvas.toDataURL('image/jpeg'),
    width: 190,
    height: 100,
    // fixme: make it centered naturally?
    x: 9,
    y: heightOffset
  }
}
