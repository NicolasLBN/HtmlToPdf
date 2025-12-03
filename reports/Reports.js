import './style.scss'

import React from 'react'

import {withRouter} from 'react-router-dom'
import server from '../../util/server'
import indexedDB from '../../util/indexedDB'
import generatedReportsDB from '../../util/generatedReportsDB'
import {ButtonHome} from '../../util/ButtonHome'
import {DeleteButton} from '../../util/DeleteButton.js'

import Log from '../../util/log'

import {getSourceAsText} from '../settings/file-helper'
import DateLine from './Reports_date'
import {Line, ErrorLine} from './Reports_line'
import {withAppTranslation} from '../../../i18n/i18n'
import {Trans} from 'react-i18next'

const log = new Log('Reports')

const REPORT_VERSION = 7
const REPORTS_COUNT = 10


class Reports extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      reports: [],
      reportsFromIndexedDB: [],
      reportsGenerated: [],
      selected: '',
      reportSelected: {},
      loaded: false,
      loadingOrigin: props.t('home.reports.disk'),
      error: null,
      localReportsCount: REPORTS_COUNT,
      remoteReportsCount: Number.MAX_SAFE_INTEGER,
      reportsUsageValue: null,
      reportUsagePercentage: null
    }
    this.handleSelect = this.handleSelect.bind(this)
    this.dismissClick = this.dismissClick.bind(this)
    this.gotoHome = this.gotoHome.bind(this)
    this.selectDelete = this.selectDelete.bind(this)
    this.view = this.view.bind(this)
    this.json = this.json.bind(this)
    this.pdf = this.pdf.bind(this)
    this.clicky = this.clicky.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.loadMoreReports = this.loadMoreReports.bind(this)
    this.isReportGenerated = this.isReportGenerated.bind(this)

    this.curriculum = React.createRef()
  }

  componentDidMount() {
    // this.getStorageStatus()
    if (this.isConnected()) this.getStorageStatus()
    this.getReports()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isOnline === 'wifi' && this.isConnected()) this.getReports()
  }

  isConnected() {
    return this.props.isOnline === 'server'
  }

  async getStorageStatus() {
    try {
      const response = await server.getStorageStatus()
      const reportsUsage = response.data.reportsUsage
      this.setState({
        reportsUsageValue: reportsUsage.value,
        reportUsagePercentage: reportsUsage.percentage,
      })
    } catch (error) {
      log.error('getStorageStatus', error)
    }
  }

  getReports() {
    this.setState({loaded: false})
    this.start = new Date()

    if (this.isConnected()) this.getRemoteReports()
    else this.getLocalReports()

    this.setState({ reportsGenerated: generatedReportsDB.read() })
  }

  async getRemoteReports() {
    let reportList = []
    try {
      reportList = await server.getReportList()
      this.setState({remoteReportsCount: reportList.length})
    } catch (error) {
      this.setState({error, loaded: true})
      log.error('getReportList', error)
      return
    }

    let reports = []

    let indexFrom = reportList.length - this.state.localReportsCount
    if (indexFrom < 0) indexFrom = 0

    for (const filename of reportList.slice(indexFrom)) {
      let report = null
      try {
        // returns undefined if the report is not in indexedDB
        report = await indexedDB.getReportByName(filename)

        if (report === undefined) {
          report = await server.getReportByName(filename)
        }

        const error = checkReport(report)
        if (error !== null) throw error
        reports.push(report)
      } catch (error) {
        if (report === null) {
          log.info(`report is null ${error.message}`)
          report = {filename, error}
        } else if (report.filename === undefined) {
          log.info(`report.filename is undefined ${error.message}`)
          report = {...report, filename, error}
        } else {
          log.info(`report is not valid ${error.message}`)
          report = {...report, error}
        }
        reports.push(report)
        log.error('getReportByName', error)
      }
    }

    try {
      this.updateState(reports)
      await indexedDB.deleteReports()
      await indexedDB.putReports(reports)
    } catch (error) {
      this.setState({error, loaded: true})
      log.error('putReports', error)
    }
  }

  async getLocalReports() {
    try {
      const reports = await indexedDB.getReports()
      this.updateState(reports)
    } catch (error) {
      this.setState({error, loaded: true})
      log.error('getLocalReports', error)
    }
  }

  updateState(reports) {
    this.setState({
      loaded: true,
      loadingTime: (new Date()) - this.start,
      loadingOrigin: this.isConnected() ? 'machine' : 'disk',
      reports: reports.reverse()
    })
  }

  selectDelete() {
    this.props.history.push(`/reports/delete/${this.state.selected}`)
  }

  handleSelect(reportFilename) {
    log.info(`selecting report ${reportFilename}`)
    this.setState({selected: reportFilename})
  }

  dismissClick() {
    this.setState({selected: ''})
  }

  gotoHome() {
    log.info('go to home')
    this.props.history.push('/')
  }

  view() {
    this.props.history.push(`/reports/view/${this.state.selected}`)
  }

  pdf() {
    this.props.history.push(`/reports/pdf/${this.state.selected}`)
  }

  async json() {
    const selected = this.state.selected
    let report = null
    try {
      report = await server.getRawReportByName(selected)
    } catch (error) {
      log.error(`Cannot get raw file of ${selected} from the server`, error)
      return
    }

    let content = report
    try {
      const parsedJson = JSON.parse(report)
      content = JSON.stringify(parsedJson, null, 2)
    } catch (error) {
      log.error(`Cannot parse raw file of ${selected}`, error)
    }

    const blob = new Blob([content], {
      type: "application/json;charset=utf-8"
    })

    saveAs(blob, selected)
  }

  clicky(event) {
    const target = event.target

    let selected = ''
    if (target.dataset.filename) {
      selected = target.dataset.filename
    } else if (target.parentElement.dataset.filename) {
      selected = target.parentElement.dataset.filename
    } else {
      selected = ''
    }

    this.setState({selected})
  }

  async handleSubmit() {
    const file = this.curriculum.current.files[0]

    const filename = file.name

    let report = null
    try {
      const rawReport = await getSourceAsText(file)
      report = JSON.parse(rawReport)

      const error = checkReport(report)
      if (error !== null) throw error

    } catch (error) {
      if (report === null) {
        report = {filename, error}
      } else if (report.filename === undefined) {
        report = {...report, filename, error}
      } else {
        report = {...report, error}
      }
      log.error('handleSubmit', error)
    }

    report.uploaded = true
    report.filename += '__uploaded'

    try {
      const reports = this.state.reports.concat([report])
      this.setState({reports})
      await indexedDB.putReports(reports)
    } catch (error) {
      log.error('cannot put reports', error)
    }

  }

  loadMoreReports() {
    this.setState((state) => {
      return {localReportsCount: state.localReportsCount + REPORTS_COUNT}
    })
    this.getReports()
  }

  isReportGenerated(filename) {
    const reports = this.state.reportsGenerated
    return reports.indexOf(filename) > -1
  }

  render() {
    const reports = this.state.reports

    this.lastDay = ''
    const ReportLines = reports.map((report) => {

      const firstDay = this.lastDay === ''
      const reportDate = report.parameters.general.startDate || 'unknown'
      const sameDay = isSameDay(this.lastDay, reportDate)
      this.lastDay = reportDate

      if (report.error) {
        return (
          <div key = {report.filename}>
            <DateLine report={report} sameDay={sameDay} firstDay={firstDay}/>
            <ErrorLine
              selected = {this.state.selected === report.filename}
              report = {report}
            />
          </div>
        )
      } else {
        return (
          <div key = {report.filename}>
            <DateLine report={report} sameDay={sameDay} firstDay={firstDay}/>
            <Line
              isCrashTest = {report.isCrashTest}
              selected = {this.state.selected === report.filename}
              report = {report}
              generated={this.isReportGenerated(report.filename) ? true : false}
            />
          </div>
        )
      }
    })

    const upload = () => {
      if (this.state.selected !== '') return ''
      if (this.props.admin !== true) return ''

      return (
        <div className="item-grid-sidebar-4  pos-align-bot">
          <label
            htmlFor="files"
            className="btn btn--flat">
            {this.props.t('reports.upload')}
          </label>
          <input
            id="files"
            type="file"
            ref={this.curriculum}
            onChange={this.handleSubmit}/>
        </div>
      )
    }


    const fetching = <h2>{this.props.t('reports.upload.in_progress')}</h2>

    const errorMessage = (
      <div>
        <div className={'warning-color'}>
          {this.props.t('reports.upload.fail')}
        </div>
        <div className={'lighter-color text-small'}>
          {this.state.error ? this.state.error.message : ''}
        </div>
      </div>
    )


    const loaded = () => {
      let classes = 'bold'
      const loadingOrigin = this.state.loadingOrigin
      if (loadingOrigin === 'disk') classes += ' warning-color'
      else classes += ' success-color'
      return (
        <div className="lighter-color text-small">
          <Trans
              i18nKey="app:reports.upload.stats"
              values={{
                totalReportsCount: this.state.reports.length,
                localReportsCount: this.state.localReportsCount,
                origin: loadingOrigin,
                milliseconds: this.state.loadingTime
              }}
              components={{ 'origin-wrapper': <span className={classes} /> }}
          />
        </div>
      )
    }

    const actions = () => {
      if (this.state.selected === '') return ''

      let jsonButton = (
        <div onClick={this.json} className={"btn btn--flat view-raw-json"}>{this.props.t('reports.actions.json')}</div>
      )
      if (this.props.admin === false) jsonButton = ''

      let deleteButton = (
        <DeleteButton cancel={this.state.isDeleteSelected} onClick={this.selectDelete}/>
      )
      if (this.isConnected() === false) deleteButton = ''

      return (
        <div className="content-right pos-align-bot">
          <div onClick={this.pdf} className={"btn btn--flat generate-pdf"}>{this.props.t('reports.actions.pdf')}</div>
          <div onClick={this.view} className={"btn btn--flat view-report"}>{this.props.t('reports.actions.view')}</div>
          {jsonButton}
          {deleteButton}
        </div>
      )
    }

    const LoadMoreReports = () => {
      if (this.isConnected() === false) return ''
      if (this.state.localReportsCount >= this.state.remoteReportsCount) return ''

      return (
        <div style={{paddingTop: 80}}>
          <div className="btn btn--raised" onClick={this.loadMoreReports}>
            {this.props.t('reports.download')}
          </div>
        </div>
      )
    }

    const storageManager = () => {
      const {reportsUsageValue, reportUsagePercentage} = this.state
      if (reportUsagePercentage === null) return ''

      let color = 'green'
      if (reportUsagePercentage >= 80) color = 'orange'
      if (reportUsagePercentage >= 100) color = 'red'

      return (
        <div className={`notification-container notification-container--${color} uppercase bold`}>
          <span className="notification notification--black">
            {this.props.t('reports.storage')}&nbsp;
          </span>
          <span className="notification notification--white">
            {`${reportsUsageValue}kb (${reportUsagePercentage})%`}
          </span>
        </div>
      )
    }


    return (
      <div className="grid-main" onClick = {this.clicky}>
        <div className = "header-right pos-align-center">
          <ButtonHome onClick = {this.gotoHome}/>
          {this.props.isOnlineComponent}
        </div>

        <div className = "content-left grid-sidebar">
          <div className = "item-grid-sidebar-1">
            <h2 className = "secondary-color">
              {this.props.t('reports.title')}
            </h2>
            {this.state.loaded ? loaded() : '-'}
          </div>
          {upload()}

        </div>

        {actions()}
        <div className = "content-center content--scrollable">
          {this.state.error ? errorMessage : ''}
          {this.state.loaded ? ReportLines : fetching}
          {this.state.loaded ? LoadMoreReports() : ''}
        </div>

        {storageManager()}

      </div>
    )
  }
}


function isSameDay(lastDay, reportDate) {
  const day1 = lastDay.split('T')[0]
  const day2 = reportDate.split('T')[0]
  return day1 === day2
}

function checkReport(report) {
  if (report.version !== REPORT_VERSION) {
    return new Error(
      `Version ${report.version} in ${report.filename} expecting ${REPORT_VERSION}`
    )
  }

  const missings = []
  if (report.filename === undefined) missings.push('filename')
  if (report.isCrashTest === undefined) missings.push('isCrashTest')
  if (report.parameters === undefined) missings.push('parameters')
  if (report.data === undefined) missings.push('data')

  if (missings.length > 0) {
    return new Error(
      `Incomplete report ${report.filename}, missing: ${missings.join ('.')}`
    )
  }

  return null
}

export default withAppTranslation()(withRouter(Reports))
