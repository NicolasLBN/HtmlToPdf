import { ImageCellRenderer } from '../custom-cell-renderers/image-cell-renderer'
import { LinkCellRenderer } from '../custom-cell-renderers/link-cell-renderer'

export function mapMetadata(
    settings,
    report,
    t,
    localeCode
) {
  const { general, cable, duct, machine } = report.parameters

  const metadata = report.metadata;
  const environment = metadata.environment
  const startAutoPressure = report.data[0].autoPressure
  const machineType = startAutoPressure !== undefined ? 'automatic' : 'reporting' 

  const hasMaxForceChanged = report.data.some((d) => d.comment === 'MAX_FORCE_CHANGED')

  let sectionName = general.sectionName
  if (sectionName === null) sectionName = ''

  let remarks = general.remarks
  const remarksKey = `metadata.general.remarks.value.${remarks}`
  let translatedRemarks = t(remarksKey)
  if (translatedRemarks === remarksKey) translatedRemarks = remarks


  function translateIfApplicable(key, value) {
    if (value === null) return ''
    let translated = t(key)
    if (translated === key) translated = value
    return translated
  }

  const t_ductIdentification = translateIfApplicable(
    `metadata.duct_section.color.value.${duct.identification}`,
    duct.identification
  )

  const t_machineLubricant = translateIfApplicable(
    `metadata.devices_section.lubricant.value.${machine.lubricant}`,
    machine.lubricant
  )

  const t_ductInnerLayer = translateIfApplicable(
    `metadata.duct_section.inner_design.value.${duct.innerLayer}`,
    duct.innerLayer
  )

  function autoPressureCell() {
    const content = machineType === 'automatic' ? [
        t('metadata.summary.auto_pressure.label'),
        '[',
        formatBoolean(startAutoPressure),
        ']'
    ] : [''];

    return textCell(content, {
        styles: {
            fillColor: '#ffffff',
        }
    });
}

  return [
    [
      textCell(settings.company.address, {
        colSpan: 2,
        styles: {
          fontSize: 7,
          lineWidth: 0,
          cellPadding: {
            top: 2,
            left: 0.5,
            bottom: 0,
          },
        },
      }),
      textCell(t('metadata.general.title'), {
        styles: {
          fontStyle: 'bold',
          fontSize: 18,
          valign: 'middle',
          halign: 'center',
        },
        rowSpan: 2,
      }),
      textCell(ImageCellRenderer.markForFutureRendering(settings.company.logo, settings.company.width, settings.company.height), {
        rowSpan: 2,
      }),
    ],
    [
      textCell(LinkCellRenderer.markForFutureRendering(settings.company.email, 'MAIL'), {
        styles: {
          fontSize: 7,
          lineWidth: 0,
          cellPadding: {
            top: -0.5,
            left: 0.5,
          },
        },
        colSpan: 2,
      }),
    ],
    [
      textCell(t('metadata.general.project.label')),
      textCell(general.projectName, { colSpan: 2 }),
      textCell([t('metadata.general.date.label'), formatDate(general.startDate)]),
    ],
    [
      textCell(t('metadata.general.trace_section.label')),
      textCell(general.sectionName, { colSpan: 3 }),
    ],
    [
      textCell(t('metadata.general.company_name.label')),
      textCell(general.company, { colSpan: 2 }),
      textCell([t('metadata.general.operator.label'), general.operator]),
    ],
    [
      textCell(t('metadata.general.remarks.label')),
      textCell(translatedRemarks, { colSpan: 3 }),
    ],
    [
      specCell(t('metadata.duct_section.title'), 2),
      specCell(t('metadata.cable_section.title')),
      specCell(t('metadata.devices_section.title')),
    ],
    [
      textCell([t('metadata.duct_section.manufacturer.label'), duct.supplier], { colSpan: 2 }),
      textCell([t('metadata.cable_section.manufacturer.label'), cable.supplier]),
      textCell([`Optijet ${machineType} (SN#${machine.machineSerialNumber})`]),
    ],
    [
      textCell([t('metadata.duct_section.duct_type.label'), duct.type], { colSpan: 2 }),
      textCell([t('metadata.cable_section.designation.label'), cable.type]),
      textCell([t('metadata.devices_section.asset.label'), machine.clientSerialNumber]),
    ],
    [
      textCell([t('metadata.duct_section.duct_assy.label'), duct.configuration], { colSpan: 2 }),
      textCell([
        t('metadata.cable_section.cable.label'),
        formatNumber(t('metadata.cable_section.cable.format'), cable.diameter),
        t('metadata.cable_section.cable.unit'),
        '     ',
        t('metadata.cable_section.fiber_amount.label'),
        formatNumber(t('metadata.cable_section.fiber_amount.format'), cable.fiberCount)
      ]),
      textCell([
        '+',
        t('metadata.devices_section.slipping_clutch.label'),
        '[',
        formatBoolean(false),
        '] +',
        t('metadata.devices_section.lubricator.label'),
        '[',
        formatBoolean(machine.lubricator),
        ']'
      ]),
    ],
    [
      textCell([
        t('metadata.duct_section.color.label'),
        t_ductIdentification
      ], { colSpan: 2 }),
      textCell([t('metadata.cable_section.reel.label'), cable.reel]),
      textCell([
        t('metadata.devices_section.lubricant.label'),
        t_machineLubricant
      ]),
    ],
    [
      textCell([
        t('metadata.duct_section.inner_design.label'),
        t_ductInnerLayer
      ], { colSpan: 2 }),
      textCell([
        t('metadata.cable_section.metering.label'),
        t('metadata.cable_section.metering.start.label'),
        formatNumber(t('metadata.cable_section.metering.start.format'), cable.meteringAtStart),
        t('metadata.cable_section.metering.start.unit'),
        t('metadata.cable_section.metering.end.label'),
        formatNumber(t('metadata.cable_section.metering.end.format'), cable.meteringAtEnd),
        t('metadata.cable_section.metering.end.unit')
      ]),
      textCell([t('metadata.devices_section.compressor.label'), machine.compressor]),
    ],
    [
      textCell([
        t('metadata.duct_section.duct_temperature.label'),
        formatNumber(t('metadata.duct_section.duct_temperature.format'), duct.temperature),
        t('metadata.duct_section.duct_temperature.unit')
      ], { colSpan: 2 }),
      textCell([
        t('metadata.cable_section.cable_temperature.label'),
        formatNumber(t('metadata.cable_section.cable_temperature.format'), cable.temperature),
        t('metadata.cable_section.cable_temperature.unit')
      ]),
      textCell([
        '+',
        t('metadata.devices_section.oil_separator.label'),
        '[',
        formatBoolean(machine.oilSeparator),
        '] +',
        t('metadata.devices_section.aftercooler.label'),
        '[',
        formatBoolean(machine.aftercooler),
        ']'
      ]),
    ],
    [
      textCell('', {colSpan: 2}),
      textCell(''),
      textCell([
        t('metadata.devices_section.cable_tap_type.label'),
        '[',
        formatBoolean(cable.head),
        ']'
      ]),
    ],
    [
      textCell(t('metadata.summary.title'), {
        styles: {
          fillColor: '#cccccc',
          fontSize: 10,
          fontStyle: 'bold',
          valign: 'middle',
          halign: 'left',
        },
      }),
      textCell([
        t('metadata.summary.max_pushforce.label'),
        formatNumber(t('metadata.summary.max_pushforce.format'), machine.maxForce),
        t('metadata.summary.max_pushforce.unit'),
        hasMaxForceChanged === false ? t('metadata.summary.max_pushforce.additional_info') : t('metadata.summary.max_pushforce.additional_info2')
      ], {
        colSpan: 2,
        styles: {
          fillColor: '#ffffff',
          valign: 'middle'
        }
      }),
      autoPressureCell()
    ],
    [
      textCell([
        t('metadata.summary.trace_distance.label'),
        formatNumber(t('metadata.summary.trace_distance.format'), metadata.distance),
        t('metadata.summary.trace_distance.unit')
      ]),
      textCell([
        t('metadata.summary.weather.label'),
        formatNumber(t('metadata.summary.weather.temperature.format'), environment.temperature),
        t('metadata.summary.weather.temperature.unit'),
        formatNumber(t('metadata.summary.weather.humidity.format'), environment.humidity),
        t('metadata.summary.weather.humidity.unit')
      ], { colSpan: 2 }),
      textCell([
        t('metadata.summary.jetting_temperature.label'),
        formatNumber(t('metadata.summary.jetting_temperature.format'), metadata.temperature.average),
        t('metadata.summary.jetting_temperature.unit')
      ]),
    ],
    [
      textCell([t('metadata.summary.jetting_duration.label'), formatDuration(metadata.duration)]),
      textCell(
        [
          t('metadata.devices_section.safetyStop'),
          '[',
          formatBoolean(machine.safetyStop),
          ']'
        ],
        { colSpan: 2 }
      ),
      textCell([t('metadata.summary.gps_location.label'), formatGpsPosition(general.position)]),
    ]
  ];

  function formatNumber (format, value) {
    if (value === null) { return '' }

    const matches = format.match(/%\.(\d+)f/)
    const decimals = matches && matches.length === 2 ? parseInt(matches[1]) : 0

    return new Intl.NumberFormat(localeCode, {
      style: 'decimal',
      useGrouping: false,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  function formatGpsPosition (position) {
    let GPS;
    if (position) {
      const lat = position.lat.toFixed(4)
      const lng = position.lng.toFixed(4)
      const alt = typeof position.alt === 'number' ? `; ${position.alt.toFixed(0)}m` : ''
      GPS = `${lat}°; ${lng}°${alt}`
    } else {
      GPS = t('metadata.summary.gps_location.noFix')
    }
    return GPS
  }

  function formatDuration (duration) {
    duration /= 1000
    const hour = Math.floor(duration / 3600)
    const min = Math.floor((duration - (hour * 3600)) / 60)
    const sec = Math.floor((duration - (hour * 3600) - (min * 60)))

    return `${hour.toFixed(0).padStart(2, '0')}:${min.toFixed(0).padStart(2, '0')}:${sec.toFixed(0).padStart(2, '0')}`
  }

  function formatValue (base, value) {
    const translated = t(`${base}.${value}`)
    if (translated === `${base}.${value}`) {
      return value
    } else {
      return translated
    }
  }

  function formatDate (dateIso) {
    const fulldate = new Date(dateIso)
    const month = ('0' + (fulldate.getMonth() + 1)).slice(-2);
    const date = ('0' + (fulldate.getDate())).slice(-2);
    const year = fulldate.getFullYear().toString().substr(2,2);
    return `${date}/${month}/${year}`;
  }

  function formatBoolean (value) {
      return value ? 'X' : '  ';
  }
}

function textCell(value, optional = {}) {
  if(!Array.isArray(value)) {
    value = [value]
  }
  return {
    ...optional,
    content: value.map(v => v === null ? '' : v).join(' '),
  };
}

function specCell(name, colSpan) {
  return textCell(name, {
    styles: {
      fillColor: '#cccccc',
      fontSize: 10,
      fontStyle: 'bold',
      valign: 'middle',
      halign: 'center',
    },
    colSpan: colSpan || 1,
  });
}
