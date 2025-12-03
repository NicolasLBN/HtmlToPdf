// @ts-ignore
import Plotly from "plotly.js-cartesian-dist";
import createPlotlyComponent from "react-plotly.js/factory";

/**
 * By default "react-plotly.js" library uses full fledged "plotly" package,
 * In our case we are using a "plotly.js-cartesian-dist", which is smaller in size.
 * This manual assignment makes sure "react-plotly.js" works with "plotly.js-cartesian-dist"
 * instead of with "plotly".
 */
export const PlotlyPlot = createPlotlyComponent(Plotly)
