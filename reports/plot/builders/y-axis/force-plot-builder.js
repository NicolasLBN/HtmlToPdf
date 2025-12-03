import { buildYAxis } from '../../default-axis-builders';
import YAxisPlotBuilder from '../y-axis/y-axis-plot-builder'
import forceHelper from './force-helper'


export class ForcePlotBuilder extends YAxisPlotBuilder{
  
  constructor(config = {}) {
    super()
    this.color = '#FF0000';
    this.config = config
    this.range = 200
    this.greaterMaxForce = 0
    this.vals = forceHelper.computeVals(this.range)
  }

  generate(inputData, xAxisData, t) {
    const forces = inputData.map(data => data.force);

    if (inputData.length > 1) {
      const maxForce = inputData[inputData.length - 1].maxForce
      if (maxForce > this.greaterMaxForce) this.greaterMaxForce = maxForce
      this.range = forceHelper.computeRange(this.greaterMaxForce)
      this.vals = forceHelper.computeVals(this.range)
    }


    return {
      yAxisNameShort: 'y',
      yAxisNameLong: 'yaxis',
      data: {
        type: 'scatter',
        mode: 'lines',
        x: xAxisData,
        y: forces,
        line: {
          color: this.color,
        },
      },
      yAxis: {
        ...buildYAxis({
          title: this.config.hideAxisLabels ? '' : `${t('charts.operation.y_axis.pushing_force.title')} [N]`,
          color: this.color,
          side: 'left'
        }),
        showticklabels: !this.config.hideAxisLabels,
        showgrid: !this.config.hideAxisLabels,
        showline: !this.config.hideAxisLabels,
        range: [0, this.range],
        tickmode: 'array',
        tickvals: this.vals,
        ticktext: this.vals
      },
    };
  }

  afterInit(graph) {
    this.makeGridDashed(graph, '.y')
    this.makeGridDashed(graph, '.x')
  }

  afterUpdate(graph) {
    this.makeGridDashed(graph, '.y')
    this.makeGridDashed(graph, '.x')
  }

  updateValue(maxForce, init = false) {
    if (init === true) this.greaterMaxForce = maxForce
    if (maxForce > this.greaterMaxForce) this.greaterMaxForce = maxForce
    this.range = forceHelper.computeRange(this.greaterMaxForce)
    this.vals = forceHelper.computeVals(this.range)
  }
}
