import { buildYAxis } from '../../default-axis-builders';
import YAxisPlotBuilder from '../y-axis/y-axis-plot-builder'

export class PressurePlotBuilder extends YAxisPlotBuilder {
  
  constructor(config = {}) {
    super()
    this.color = '#0000FF';
    this.config = config
  }

  generate(inputData, xAxisData, t) {
    const speed = inputData.map(data => data.blowing);

    return {
      yAxisNameShort: 'y3',
      yAxisNameLong: 'yaxis3',
      data: {
        type: 'scatter',
        mode: 'lines',
        x: xAxisData,
        y: speed,
        line: {
          color: this.color,
          width: 1,
        },
      },
      yAxis: {
        ...buildYAxis({
          title: this.config.hideAxisLabels ? '' :`${t('charts.operation.y_axis.duct_pressure.title')} [bar]`,
          color: this.color,
          axisLinesColor: this.color,
          side: 'right',
        }),
        showticklabels: !this.config.hideAxisLabels,
        showline: !this.config.hideAxisLabels,
        range: [0, 20],
        nticks: this.config.hideAxisLabels ? 1 : 21,
        showgrid: false,
        anchor: 'free',
        overlaying: 'y',
        position: 1.0,
      },
    };
  }

  afterInit(graph) {
    this.rotateAxisTitle(graph, '.y3title');
  }

  afterUpdate(graph) {
    this.rotateAxisTitle(graph, '.y3title');
  }
}
