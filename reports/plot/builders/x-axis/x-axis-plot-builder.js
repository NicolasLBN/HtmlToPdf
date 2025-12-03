export default class XAxisPlotBuilder {

  constructor() {}

  appendPlot(
      inputData,
      yAxisPlotBuilders,
      t,
  ) {
    const data = [];
    const layout = {};

    const buildResult = this.generate(inputData, t);
    layout.xaxis = buildResult.xAxis;

    yAxisPlotBuilders.forEach(builder => {
      builder.appendPlot(inputData, buildResult.data, data, layout, t);
    })

    return {layout, data};
  }

}
