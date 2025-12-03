const AXIS_TITLE_FONT_SIZE = 15;
const AXIS_TICK_FONT_SIZE = 11;
export const AXIS_FONT_FAMILY = 'helvetica, monospace';
export const AXIS_LINES_COLOR = '#808080'

export function buildYAxis({ title, color, side, axisLinesColor = AXIS_LINES_COLOR }) {
  const sideConfig = {
    tickPrefix: side === 'left' ? '' : ' ',
    tickSuffix: side === 'left' ? ' ' : '',
    showgrid: side === 'left'
  }

  return {
    showgrid: sideConfig.showgrid,
    title: {
      text: title,
      font: {
        family: AXIS_FONT_FAMILY,
        size: AXIS_TITLE_FONT_SIZE,
        color: color,
      },
      standoff: 0
    },
    tickfont: {
      family: AXIS_FONT_FAMILY,
      size: AXIS_TICK_FONT_SIZE,
      color: color,
    },
    tickprefix: sideConfig.tickPrefix,
    ticksuffix: sideConfig.tickSuffix,
    showline: true,
    linecolor: axisLinesColor,
    tickcolor: axisLinesColor,
    ticklen: 3,
    side
  };
}

export function buildXAxis({title}) {
  const textColor = '#000000'
  return {
    title: {
      text: title,
      font: {
        family: AXIS_FONT_FAMILY,
        size: AXIS_TITLE_FONT_SIZE,
        color: textColor
      }
    },
    tickfont: {
      family: AXIS_FONT_FAMILY,
      size: AXIS_TICK_FONT_SIZE,
      color: textColor,
    },
    linecolor: AXIS_LINES_COLOR,
    mirror: true,
    tickcolor: AXIS_LINES_COLOR,
    ticklen: 3,
    rangemode: 'tozero',
    domain: [0, 0.9],
    nticks: 11
  }
}
