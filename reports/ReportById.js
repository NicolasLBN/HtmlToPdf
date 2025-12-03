import './style.scss';

import React from 'react';
import {withRouter} from 'react-router-dom';

import time from '../../../../../common/time';
import Log from '../../util/log';
import {Plot} from './plot/Plot';
import {ForcePlotBuilder} from './plot/builders/y-axis/force-plot-builder';
import {SpeedPlotBuilder} from './plot/builders/y-axis/speed-plot-builder';
import {PressurePlotBuilder} from './plot/builders/y-axis/pressure-plot-builder';
import {withAppTranslation} from '../../../i18n/i18n';
import i18n from 'i18next';
import {DistancePlotBuilder} from './plot/builders/x-axis/distance-plot-builder';

const log = new Log('ReportById')
const indexedDB = require('../../util/indexedDB')


class ReportById extends React.Component {

  constructor(props) {
    super(props)
    this.reportFilename = props.match.params.filename
    this.state = {
      report: null,
      error: null,
      yAxisPlotBuilders: [
        new ForcePlotBuilder(),
        new SpeedPlotBuilder(),
        new PressurePlotBuilder(),
      ],
      xAxisPlotBuilder: new DistancePlotBuilder(),
      chartT: i18n.getFixedT(null, 'chart')
    };
    this.close = this.close.bind(this)
  }

  async componentDidMount() {
    try {
      const report = await indexedDB.getReportByName(this.reportFilename);
      if (!report.data || report.data.length === 0) throw new Error('The report is empty')

      this.setState({report})
    } catch (error) {
      this.setState({error})
      log.error(`report ${this.reportFilename} is not in IndexedDB`, error)
    }
  }

  close() {
    this.props.history.push('/reports')
  }

  render() {
    const report = this.state.report

    let errorMessage = ''
    if (this.state.error !== null) {
      errorMessage = (
        <div className="warning-color">{this.state.error.message}</div>
      )
    }

    let maxForce = ''
    let plot = ''
    let side = ''
    let title = (
      <div className="header-1">
          <h3 className="h3--big secondary-color">{this.props.t('reports.view.title')}</h3>
      </div>
    )
    if (report !== null) {

      maxForce = `${report.parameters.machine.maxForce}N`
      if (report.parameters.machine.forceLimited === false) maxForce = 'BOOST'

      plot = (
        <Plot
            yAxisPlots={this.state.yAxisPlotBuilders}
            xAxisPlot={this.state.xAxisPlotBuilder}
            recordedData={report.data}
            t={this.state.chartT}
        />
      )

      title = (
        <div className="header-1">
          <h3 className="h3--big secondary-color">
            {report.isCrashTest ? this.props.t('reports.view.title.crash_test') : this.props.t('reports.view.title')}
          </h3>
        </div>
      )

      let duration = '#'
      if (report.metadata) {
        duration = time.second.readable(report.metadata.duration / 1000)
      }
      side = (
        <div className="content-left grid-sidebar">
          <div className={"sidebar-1"}>
            <span className = "item-ml grid-cables">
              <div className = "duct"></div>
              <div className = "arrow-duct-left"></div>
              <div className = "arrow-duct-right"></div>
              <div className = "cable">
                <div className = "arrow-cable-left"></div>
                <span className = "pos-align-bot text-medium pos-justify-center">{report.parameters.cable.diameter}</span>
                <span className = "pos-align-top pos-justify-center">mm</span>
                <div className = "arrow-cable-right"></div>
              </div>
              <div className = "duct-number">
                <span className = "pos-align-bot primary-color bold text-medium">{report.parameters.duct.innerDiameter}</span>
                <span className = "pos-align-top primary-color">mm</span>
              </div>
            </span>
          </div>
          <div className={"sidebar-2 pos-align-center"}>
            {`${getDate(report.parameters.general.startDate)} ${getTime(report.parameters.general.startDate)}`}
          </div>
          <div className={"sidebar-3 pos-align-center"}>
            <div>{this.props.t('reports.view.max_force')} = {maxForce}</div>
            <div>{this.props.t('reports.view.duration')} = {duration}</div>
            <div>{this.props.t('reports.view.distance')} = {report.metadata ? report.metadata.distance : '#'}m</div>
          </div>
          <div className={"sidebar-4 pos-align-center"}>
            <div>{report.parameters.general.projectName}</div>
            <div>{report.parameters.general.sectionName}</div>
            <div>{report.parameters.general.company}</div>
            <div>{report.parameters.general.operator}</div>
          </div>
        </div>
      )
    }

    return (
      <div className="grid-main">

        {title}

        <div className={"header-2-5  pos-align-center"}>
          {errorMessage}
        </div>

        <div className={"header-right"}>
          <div className={"btn btn--raised"} onClick={this.close}>
            {this.props.t('home.reports')}
          </div>
          {this.props.isOnlineComponent}
        </div>

        {side}

        <div className='content-center'>{plot}</div>

      </div>
    )
  }

}

export default withAppTranslation()(withRouter(ReportById))


function getDate(strDate) {
  const date = new Date(strDate)
  const year = String(date.getFullYear()).padStart(4, 0)
  const month = String(date.getMonth() + 1).padStart(2, 0)
  const day = String(date.getDate()).padStart(2, 0)
  return `${year}-${month}-${day}`
}

function getTime(strDate) {
  const date = new Date(strDate)
  const hours = String(date.getHours()).padStart(2, 0)
  const minutes = String(date.getMinutes()).padStart(2, 0)
  return `${hours}:${minutes}`
}
