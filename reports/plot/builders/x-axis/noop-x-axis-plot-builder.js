import XAxisPlotBuilder from '../x-axis/x-axis-plot-builder'

export class NoopXAxisPlotBuilder extends XAxisPlotBuilder {
  constructor() {
    super()
  }

  generate(inputData, t) {
    return {
      data: [],
      xAxis: {
        domain: [0, 0.9],
        nticks: 0,
        mirror: false,
        showticklabels: false,
        showgrid: false,
        rangemode: 'tozero',
        showline: false
      }
    };
  }
}
