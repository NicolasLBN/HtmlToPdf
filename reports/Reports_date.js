import React from 'react'
import {withAppTranslation} from '../../../i18n/i18n';


const DateLine = (props) => {
  const reportDate = props.report.parameters.general.startDate
  let dateClass = props.firstDay ? 'report-date--first' : 'report-date'

  if (!reportDate) {
    return (
      <div className={dateClass}>
        <span className={'bold text-medium'}>Unknown date</span>
      </div>
    )
  }

  if (props.sameDay) {
    return ''
  } else {
    let day = {value: reportDate.split('T')[0]}
    day.label = getSinceLabel(reportDate, props.t)
    return (
      <div className = {dateClass}>
        <span className = {'bold text-medium'}>
          {day.label ? day.label : day.value}
        </span>
        <span className = {'light-color'}>
          {day.label ? ` (${day.value})` : ''}
        </span>
      </div>
    )
  }
}

export default withAppTranslation()(DateLine)


function getSinceLabel(reportDate, t) {
  const msAgo = (new Date()) - new Date(reportDate)
  const daysAgo = Math.round(msAgo / (24 * 60 * 60 * 1000))

  if (daysAgo === 0) return t('reports.date.today')
  if (daysAgo === 1) return t('reports.date.yesterday')

  return null
}
