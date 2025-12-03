import '../home/style.scss'

import React,{useState} from 'react'
import {useHistory, useParams} from 'react-router-dom'
const generatedReportsDB = require('../../util/generatedReportsDB');

import server from '../../util/server'
import Log from '../../util/log'
const log = new Log('DeleteRe...')
import {withAppTranslation} from '../../../i18n/i18n'


export default withAppTranslation()(DeleteReport)


function DeleteReport(props) {
  let history = useHistory()
  let {filename} = useParams()

  let [error, setError] = useState(null)
  let [status, setStatus] = useState('idle')

  async function handleDelete() {
    log.info(filename)
    try {
      setStatus('busy')
      const result = await server.deleteReportByName(filename)
      if (result.ok === false) throw new Error('server.deleteReportByName(filename)')
      generatedReportsDB.deleteByName(filename)
      setStatus('idle')
      history.push('/reports')
    } catch (error) {
      setStatus('idle')
      setError(error)
      log.error('Cannot delete from the server')
    }
  }

  function gotoCancel() {
    history.push('/reports')
  }

  const yesButton = (
    <div
      className={"btn btn--raised--white item-grid-modal-bottom-left pos-align-center"}
      onClick={handleDelete}>
      {props.t('reports.delete.actions.yes')}
    </div>
  )

  const noButton = (
    <div
      className={"btn btn--raised item-grid-modal-bottom-right pos-align-center"}
      onClick={gotoCancel}>
      {props.t('reports.delete.actions.no')}
    </div>
  )

  const cancelButton = (
    <div
      className={"btn btn--raised item-grid-modal-bottom-right pos-align-center"}
      onClick={gotoCancel}>
      {props.t('reports.delete.actions.cancel')}
    </div>
  )

  let message = ''
  if (status === 'busy') {
    message = (
      <div className = "text-center">
        {props.t('reports.delete.in_progress')}
      </div>
    )
  }
  if (error !== null) {
    message = (
      <div className = "text-center warning-color">
        {props.t('reports.delete.fail')}
      </div>
    )
  }

  return (
    <div className = "grid-main background-blue">
      <div className = "header-right">
        {props.isOnlineComponent}
      </div>
      <div className = "content-center pos-align-top grid-modal modal">
        <h2 className = "item-grid-modal-top pos-align-center">
          {props.t('reports.delete.title')}
        </h2>
        <div className = "item-grid-modal-middle">
          <h4 className = "item-grid-inside-modal-t">
            {filename}
          </h4>
          {message}
        </div>
        {error === null ? yesButton : ''}
        {error === null ? noButton : ''}
        {error !== null ? cancelButton : ''}
      </div>
    </div>
  )

}
