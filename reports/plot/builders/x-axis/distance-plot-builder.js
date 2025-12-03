import { buildXAxis } from '../../default-axis-builders';
import XAxisPlotBuilder from '../x-axis/x-axis-plot-builder'

export class DistancePlotBuilder extends XAxisPlotBuilder {
  constructor() {
    super()
  }

  generate(inputData, t) {
    return {
      data: inputData.map(data => data.distance),
      xAxis: {
        ...buildXAxis({
          title: `${t('charts.operation.x_axis.distance.title')} [m]`,
        }),
      },
    };
  }
}
