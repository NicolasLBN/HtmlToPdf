import React, { useEffect, useState } from 'react'
import { AXIS_FONT_FAMILY } from './default-axis-builders'
import { PlotlyPlot } from './PlotlyPlot'


export const Plot = (props) => {
  const [data, setData] = useState([])
  const [layout, setLayout] = useState({})
  const [config] = useState(() => ({
    displayModeBar: false,
    staticPlot: true,
    setBackground: () => 'transparent'
  }))
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const { layout, data } = props.xAxisPlot.appendPlot(props.recordedData, props.yAxisPlots, props.t)

    setData(data)

    const showTitle = props.showTitle === undefined ? false : props.showTitle

    setLayout({
      ...getDefaultLayout(showTitle, props.t('charts.operation.title')),
      ...layout,
    })
    setIsInitialized(true)
  }, [props.t, props.yAxisPlots, props.xAxisPlot, props.recordedData, props.showTitle, props.maxForce])

  if (!isInitialized) return null

  return <div style={{position: 'relative'}}>
    <PlotlyPlot
      data={data}
      layout={layout}
      config={config}
      onInitialized={(_, graph) => {
        props.yAxisPlots.forEach((builder) => builder.afterInit(graph))
        props.afterInit(graph)
      }}
      onUpdate={(figure, graph) => {
        setData(figure.data)
        setLayout(figure.layout)
        props.yAxisPlots.forEach((builder) => builder.afterUpdate(graph))
      }}
    />
  </div>
}

function getDefaultLayout(showTitle, mainTitle) {
  if (showTitle === true) {
    return {
      title: {
        text: mainTitle,
        font: {
          size: 15,
          color: '#000000',
          family: AXIS_FONT_FAMILY,
        },
      },
      showlegend: false,
      hovermode: false,
      width: 781,
      height: 436,
      margin: { l: 64, r: 64, b: 48, t: 32 },
    }
  } else {
    return {
      title: undefined,
      showlegend: false,
      hovermode: false,
      width: 781,
      height: 436,
      margin: { l: 64, r: 64, b: 48, t: 32 },
    }
  }
}
