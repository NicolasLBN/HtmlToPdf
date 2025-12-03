import { buildXAxis } from '../../default-axis-builders';
import XAxisPlotBuilder from '../x-axis/x-axis-plot-builder'

export class TimePlotBuilder extends XAxisPlotBuilder {
  constructor() {
    super()
  }

  generate(inputData, t) {
    return {
      data: inputData.map(data => new Date(data.stamp).toISOString()),
      xAxis: {
        ...buildXAxis({
          title: `${t('charts.operation.x_axis.time.title')} [hh:mm:ss]`
        }),
        /**
         * When there is no data to display plotly automatically adds a couple of numbers as data.
         * The problem is that plotly added numbers and normally we format them as dates.
         * This results in displaying a warn message in a console
         * saying that it has problems formatting number to date.
         *
         * In order not to show warnings in a console when there is no data we need to reset tick formatting.
         */
        tickformat: inputData.length === 0 ? undefined : '%H:%M:%S',
      }
    };
  }
}
