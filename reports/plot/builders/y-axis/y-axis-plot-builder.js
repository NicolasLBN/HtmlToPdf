import { AXIS_LINES_COLOR } from '../../default-axis-builders';


export default class YAxisPlotBuilder {

  constructor() {}

  appendPlot(
      inputData,
      xAxisData,
      allData,
      layout,
      t
  ) {
    const buildResult = this.generate(inputData, xAxisData, t);
    if (buildResult.yAxisNameShort) {
      buildResult.data.yaxis = buildResult.yAxisNameShort;
    }
    allData.push(buildResult.data);
    layout[buildResult.yAxisNameLong] = buildResult.yAxis;
  }

  /**
   * Overridable
   * Can modify an html element by hand
   */
  // afterInit(graph) {}

  /**
   * Overridable
   * Can modify an html element by hand
   *
   * It was necessary, because previously we manually applied styles to a background grid
   * on afterInit. Unfortunately, the styles reset when the chart is re rendered.
   * This hook allows us to re add the styles and make the look of the chart consistent.
   */
  // afterUpdate(graph) {}

  rotateAxisTitle(graph, className) {
    const titleElement = graph.querySelector(className);
    if (!titleElement) {
      return;
    }
    const x = titleElement.getAttribute('x');
    const y = titleElement.getAttribute('y');
    titleElement.setAttribute('transform', `rotate(90,${x}, ${y})`);
  }

  makeGridDashed(graph, className) {
    const paths = graph.querySelectorAll(`.gridlayer > ${className} > path`);
    paths.forEach(path => {
      path.style.strokeDasharray = '3,3';
      path.style.stroke = AXIS_LINES_COLOR;
    });
  }
}
