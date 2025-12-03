import React from 'react'
import word from '../../util/word'
import {useAppTranslation} from '../../../i18n/i18n';

import pdfNotGenerated from '../../img/icons/pdf-not-generated.png';
import pdfGenerated from '../../img/icons/pdf-generated.png';

export const Line = (props) => {
  const {t} = useAppTranslation()

  const {filename, date, isCrashTest} = props.report
  let classToAdd = ''
  if (props.selected === true) classToAdd = 'report-line--selected'
  const readableDate = getTime(props.report.parameters.general.startDate)

  const {
    projectName, operator, company, sectionName
  } = props.report.parameters.general

  const truncatedProjectName = word.truncate(projectName, 50)
  const truncatedSectionName = word.truncate(sectionName, 50)
  const truncatedCompany = word.truncate(company, 21)
  const truncatedOperator = word.truncate(operator, 21)

  let label = isCrashTest ? t('reports.report.status.crash_test') : '-'
  let labelClass = 'light-color'
  if (props.report.uploaded == true) {
    label = t('reports.report.status.uploaded')
    labelClass = 'bold'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div
      data-filename={filename}
      className={ "report-line grid-report-line " + classToAdd}>
      <div className = "item-grid-report-line-ml--long pos-align-center">
        {truncatedProjectName}
      </div>
      <p className = {`item-grid-report-line-tr  pos-align-center pos-justify-right ${labelClass}`}>
        {label}
      </p>
      <p className = "item-grid-report-line-bl--long pos-align-center light-color">
        {truncatedSectionName}
      </p>
      <p className = "item-grid-report-line-mr pos-align-center pos-justify-right light-color">
        {truncatedCompany}
      </p>
      <p className = "item-grid-report-line-tl pos-align-center bold">
        {readableDate}
      </p>
      <p className = "item-grid-report-line-br pos-align-center pos-justify-right light-color">
        {truncatedOperator}
      </p>
    </div>
      <div style={{ margin: '1em' }}>
        <p className="item-grid-report-line-br pos-align-center pos-justify-right light-color">
          {props.generated ?
            (<img src={pdfGenerated} alt="Pdf has already been generated" />) :
            (<img src={pdfNotGenerated} alt="Pdf has not already been generated" />)
          }
        </p>
      </div>
    </div>
  )
}

export const ErrorLine = (props) => {
  const {t} = useAppTranslation()

  const {filename, error, isCrashTest} = props.report
  let classToAdd = ''
  if (props.selected === true) classToAdd = 'report-line--selected'

  let label = isCrashTest ? t('reports.report.status.crash_test') : '-'
  let labelClass = 'light-color'
  if (props.report.uploaded == true) {
    label = t('reports.report.status.uploaded')
    labelClass = 'bold'
  }

  return (
    <div
      data-filename={filename}
      className={ "report-line grid-report-line " + classToAdd}>
      <div className = "item-grid-report-line-ml--long pos-align-center">
        {error.message}
      </div>
      <p className = {`item-grid-report-line-tr  pos-align-center pos-justify-right ${labelClass}`}>
        {label}
      </p>
      <p className = "item-grid-report-line-tr  pos-align-center pos-justify-right  light-color">
        {error.code}
      </p>
      <p className = "item-grid-report-line-tl pos-align-center bold warning-color">
        {t('reports.report.status.error')}
      </p>
    </div>
  )
}


function getTime(strDate) {
  const date = new Date(strDate)
  const hours = String(date.getHours()).padStart(2, 0)
  const minutes = String(date.getMinutes()).padStart(2, 0)
  const seconds = String(date.getSeconds()).padStart(2, 0)
  return `${hours}:${minutes}:${seconds}`
}
