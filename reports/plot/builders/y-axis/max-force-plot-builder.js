import { ForcePlotBuilder } from './force-plot-builder';
import YAxisPlotBuilder from '../y-axis/y-axis-plot-builder'
import forceHelper from './force-helper'

export class MaxForcePlotBuilder extends YAxisPlotBuilder {

  constructor(config) {
    super()
    this.config = config
    this.range = forceHelper.computeRange(config.maxForce)
    this.greaterMaxForce = 0
  }

  generate(inputData, xAxisData, t) {
    const maxForces = inputData.map(data => data.maxForce);

    if (inputData.length > 1) {
      const maxForce = inputData[inputData.length - 1].maxForce
      if (maxForce > this.greaterMaxForce) this.greaterMaxForce = maxForce
      this.range = forceHelper.computeRange(this.greaterMaxForce)
    }

    return {
      yAxisNameShort: undefined,
      yAxisNameLong: 'yaxis4',
      data: {
        y: maxForces,
        x: xAxisData,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: ForcePlotBuilder.color,
          width: 1,
          dash: 'dash'
        }
      },
      yAxis: {
        visible: false,
        showgrid: false,
        overlaying: 'y',
        range: [0, this.range]
      }
    };
  }

  updateValue(maxForce) {
    if (maxForce > this.greaterMaxForce) this.greaterMaxForce = maxForce
    this.range = forceHelper.computeRange(this.greaterMaxForce)
  }

}
