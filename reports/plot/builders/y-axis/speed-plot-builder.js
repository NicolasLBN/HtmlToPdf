import { buildYAxis } from '../../default-axis-builders';
import YAxisPlotBuilder from '../y-axis/y-axis-plot-builder'


export class SpeedPlotBuilder extends YAxisPlotBuilder{
  
  constructor(config = {}) {
    super()
    this.color = '#008000';
    this.config = config
  }

  generate(inputData, xAxisData, t) {
    const speed = inputData.map(data => data.speed);

    return {
      yAxisNameShort: 'y2',
      yAxisNameLong: 'yaxis2',
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
          title: this.config.hideAxisLabels ? '' : `${t('charts.operation.y_axis.speed.title')} [m/min]`,
          color: this.color,
          side: 'right',
        }),
        showticklabels: !this.config.hideAxisLabels,
        showline: !this.config.hideAxisLabels,
        range: [0, 100],
        nticks: this.config.hideAxisLabels ? 1 : 21,
        showgrid: false,
        anchor: 'x',
        overlaying: 'y',
      },
    };
  }

  afterInit(graph) {
    this.rotateAxisTitle(graph, '.y2title')
  }

  afterUpdate(graph) {
    this.rotateAxisTitle(graph, '.y2title')
  }
}
