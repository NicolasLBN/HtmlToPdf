import './style.scss'

import slug from 'slug'
import React from 'react'
import {withRouter} from 'react-router-dom'

import Log from '../../util/log'
import {ForcePlotBuilder} from './plot/builders/y-axis/force-plot-builder';
import {SpeedPlotBuilder} from './plot/builders/y-axis/speed-plot-builder';
import {PressurePlotBuilder} from './plot/builders/y-axis/pressure-plot-builder';
import {Plot} from './plot/Plot';
import {PdfBuilderV2} from './pdf/pdf-builder-v2';
import i18n from 'i18next';
import {Language} from '../../contexts/language';
import {withAppTranslation} from '../../../i18n/i18n';
import {DistancePlotBuilder} from './plot/builders/x-axis/distance-plot-builder';
const log = new Log('PdfReport')
const indexedDB = require('../../util/indexedDB')
const generatedReportsDB = require('../../util/generatedReportsDB');

class PdfReport extends React.Component {

  constructor(props) {
    super(props)
    this.reportFilename = props.match.params.filename

    this.forcePlotBuilder = new ForcePlotBuilder()

    this.state = {
      report: null,
      status: 'doing',
      error: null,
      yAxisPlotBuilders: [
        this.forcePlotBuilder,
        new SpeedPlotBuilder(),
        new PressurePlotBuilder(),
      ],
      xAxisPlotBuilder: new DistancePlotBuilder(),
    }
    this.close = this.close.bind(this)
  }

  async componentDidMount() {
    this.setState({
      chartT: i18n.getFixedT(this.context.selectedReportLanguageId, 'chart')
    })
    try {
      const report = await indexedDB.getReportByName(this.reportFilename)
      if (!report.data || report.data.length === 0) throw new Error(`The report ${this.reportFilename} is empty`)

      let maxForce = report.parameters.machine.maxForce
      report.data.forEach((point) => {
        if (point.maxForce > maxForce) maxForce = point.maxForce
      })
      this.forcePlotBuilder.updateValue(maxForce)
      // We need that so the UI can show a waiting message, otherwise the UI is blocked and the user thinks nothing is happening
      this.setState({report})
    } catch (error) {
      this.setState({error, status: 'failed'})
      log.error(`report ${this.reportFilename} is not in IndexedDB`, error)
    }
  }

  async build(report, graphElement) {
    const allSvg = [...graphElement.getElementsByTagName('svg')]
    const svgs = allSvg.map((svg) => svg.outerHTML)

    let {projectName, sectionName, startDate} = report.parameters.general
    
    if (sectionName === null) sectionName = ''
    if (projectName === null) projectName = 'no project'
    
    let filename = 'filename'
    try {
      const formattedDate = formatDate(startDate)
      filename = `${slug(projectName)}_${formattedDate}_${slug(sectionName)}.pdf`
    } catch (error) {
      this.setState({error, status: 'failed'})
      log.error(`report metadata problem for ${this.reportFilename} - ${JSON.stringify({startDate, projectName, sectionName})}`, error)

      return console.error(error)
    }

    try {
      log.info(`generating pdf of report ${report.filename}`)
      const pdfBuilder = new PdfBuilderV2(
          filename,
          svgs,
          this.props.settings,
          report,
          i18n.getFixedT(this.context.selectedReportLanguageId, 'report'),
          this.context.selectedReportLanguageId
      )
      await pdfBuilder.build()
      await pdfBuilder.save()

      generatedReportsDB.add(report.filename)

      this.setState({status: 'done'})

      log.info(`pdf for report ${this.reportFilename} has been created`)
      this.props.history.push('/reports')
    } catch (error) {
      this.setState({error, status: 'failed'})
      log.error(`cannot build and save the pdf for report ${this.reportFilename}`, error)
    }
  }

  close() {
    this.props.history.push('/reports')
  }

  render() {
    const messages = {
      doing: this.props.t('reports.pdf_generator.in_progress'),
      done: this.props.t('reports.pdf_generator.success'),
      failed: this.props.t('reports.pdf_generator.fail')
    }

    const closeButton = (
      <div onClick={this.close} className={"btn btn--raised"}>{this.props.t('reports.pdf_generator.close')}</div>
    )

    let errorMessage = ''
    if (this.state.error !== null) {
      errorMessage = (
        <div className="warning-color">{this.state.error.message}</div>
      )
    }

    let plot = ''
    if (this.state.report) {
      plot = (
          <Plot
              yAxisPlots={this.state.yAxisPlotBuilders}
              xAxisPlot={this.state.xAxisPlotBuilder}
              recordedData={this.state.report.data}
              t={this.state.chartT}
              afterInit={(graph) => {
                this.build(this.state.report, graph);
              }}
          />
      )
    }

    return (
      <div className="grid-main">

        <div className="header-1">
          <h3 className="h3--big secondary-color">PDF</h3>
        </div>

        <div className={"header-2-5 pos-align-center"}>
          <h3>{messages[this.state.status]}</h3>
          {errorMessage}
        </div>

        <div className={"header-right"}>
          {this.state.status === 'failed' ? closeButton : ''}
          {this.props.isOnlineComponent}
        </div>

        <div className='content-center'>{plot}</div>

      </div>
    )
  }

}

PdfReport.contextType = Language.Context

function formatDate(startDate) {
  const date = new Date(startDate)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}_${hours}-${minutes}`
}

export default withAppTranslation()(withRouter(PdfReport))
