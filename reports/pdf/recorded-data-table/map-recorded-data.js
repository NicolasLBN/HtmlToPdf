export function mapRecordedData(
  data,
  isCrashTest,
  t
) {
  // there is 2 versions of the JSON report. In the old one, the timestamp of
  // the data table are from the epoch, that is arround 1600000000000 ms. In
  // the new version, the timestamps start at 0 at the beginning of the
  // recording To accomodate this difference and to be sure that the displayed
  // duration starts at 00:00:00 for the first row, we substract the timestamp
  // of each row by the value of the timestamp of the first row.
  const startTimestamp = data[0]['stamp'] || 0
  return data.map(measurement => {
    return {
      distance: Number(measurement['distance']).toFixed(1),
      force: String(measurement['force'] || '0'),
      blowing: Number(measurement['blowing']).toFixed(1),
      speed: Number(measurement['speed']).toFixed(1),
      time: formatDuration(measurement['stamp'] - startTimestamp, isCrashTest),
      comment: formatRemarks(measurement['comment'].trim(), measurement['customValue']),
    }
  })

  function formatRemarks(comment, customValue) {
    const commentKey = `recorded_data.columns.remarks.value.${comment}`
    let translatedComment = t(commentKey)
    if (translatedComment === commentKey) {
      translatedComment = comment
    } else {
      translatedComment = translatedComment.replace('%TIME%', customValue ? formatTime(customValue) : '')
      translatedComment = translatedComment.replace('%INTEGER%', customValue ? customValue.toFixed(0) : '')
    }
    return translatedComment
  }

  function formatTime(value) {
    const date = new Date(value)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  function formatDuration(duration, includeMillis) {
    duration /= 1000
    const hour = Math.floor(duration / 3600)
    const min = Math.floor((duration - (hour * 3600)) / 60)
    const sec = Math.floor((duration - (hour * 3600) - (min * 60)))

    let baseTime = `${hour.toFixed(0).padStart(2, '0')}:${min.toFixed(0).padStart(2, '0')}:${sec.toFixed(0).padStart(2, '0')}`
    if (!includeMillis) {
      return baseTime
    }
    const ms = (duration - (hour * 3600) - (min * 60) - sec) * 1000
    return `${baseTime}.${ms}`
  }
}
