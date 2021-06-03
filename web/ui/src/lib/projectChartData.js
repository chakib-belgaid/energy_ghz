import _ from 'lodash'
import color from 'chartjs-color'

import { colors } from './colors'
import { formatFloat } from './common'

function createChartData(reports) {
  let data = reports

  let unit = 'ns'
  let testValue = data[0].average
  let divr = 1

  if (testValue > 1000000) {
    unit = 'ms'
    divr = 1000000
    testValue = testValue / divr
  }

  if (testValue > 1000000000) {
    unit = 's'
    divr = 1000000000
  }

  const avgs = data.map(d => d.average / divr)
  const energies = data.map(d => d.energy_per_request / divr)
  const fasts = data.map(d => d.fastest / divr)
  const slows = data.map(d => d.slowest / divr)
  const rps = data.map(d => d.rps)
  const nine5 = _(data)
    .map(r => {
      const elem = _.find(r.latencyDistribution, ['percentage', 95])
      if (elem) {
        return elem.latency / divr
      }
    })
    .compact()
    .valueOf()

  const nine9 = _(data)
    .map(r => {
      const elem = _.find(r.latencyDistribution, ['percentage', 99])
      if (elem) {
        return elem.latency / divr
      }
    })
    .compact()
    .valueOf()

  const fifty = _(data)
    .map(r => {
      const elem = _.find(r.latencyDistribution, ['percentage', 50])
      if (elem) {
        return elem.latency / divr
      }
    })
    .compact()
    .valueOf()

  const dates = data.map(d => d.date)
  const languages = data.map(d => d.tags.language)
  return {

    averate: avgs,
    energies: energies,
    fastest: fasts,
    slowest: slows,
    nine5: nine5,
    nine9: nine9,
    fifty: fifty,
    languages,
    rps,
    dates,
    unit
  }
}

function createLineChart(reports) {
  if (!reports) {
    return
  }

  const chartData = createChartData(reports)
  const dates = chartData.dates
  const unit = chartData.unit
  const languages = chartData.languages
  const avgData = []
  const energyData = []
  const fastData = []
  const slowData = []
  const n50Data = []
  const n95Data = []
  const n99Data = []
  const rpsData = []

  languages.forEach((v, i) => {
    const d = v
    avgData[i] = {
      x: d,
      y: formatFloat(chartData.averate[i])
    }
    fastData[i] = {
      x: d,
      y: formatFloat(chartData.fastest[i])
    }
    slowData[i] = {
      x: d,
      y: formatFloat(chartData.slowest[i])
    }
    n50Data[i] = {
      x: d,
      y: formatFloat(chartData.fifty[i])
    }
    n95Data[i] = {
      x: d,
      y: formatFloat(chartData.nine5[i])
    }
    n99Data[i] = {
      x: d,
      y: formatFloat(chartData.nine9[i])
    }
    rpsData[i] = {
      x: d,
      y: formatFloat(chartData.rps[i])
    }
    energyData[i] = {
      x: d,
      y: formatFloat(chartData.energies[i])
    }

  })

  const cubicInterpolationMode = 'monotone' // set to 'default' to get cubic
  const lineTension = undefined // set to 0 to have straing lines
  const borderWidth = 1.75
  const pointRadius = 1.75

  const datasets = [
    {
      label: 'Average',
      backgroundColor: color(colors.skyBlue).alpha(0.5).lighten(0.5).rgbString(),
      borderColor: colors.blue,
      fill: false,
      data: avgData,
      yAxisID: 'y-axis-lat',
      cubicInterpolationMode,
      lineTension,
      borderWidth,
      pointRadius
    },
    {
      label: 'Fastest',
      backgroundColor: color(colors.green).alpha(0.5).lighten(0.5).rgbString(),
      borderColor: colors.green,
      fill: false,
      data: fastData,
      yAxisID: 'y-axis-lat',
      cubicInterpolationMode,
      borderWidth,
      pointRadius,
      lineTension
    },
    {
      label: 'Slowest',
      backgroundColor: color(colors.red).alpha(0.5).lighten(0.5).rgbString(),
      borderColor: colors.red,
      fill: false,
      data: slowData,
      yAxisID: 'y-axis-lat',
      cubicInterpolationMode,
      borderWidth,
      pointRadius,
      lineTension
    },
    {
      label: 'median',
      backgroundColor: color(colors.orange).alpha(0.5).lighten(0.5).rgbString(),
      borderColor: colors.orange,
      fill: false,
      data: n50Data,
      yAxisID: 'y-axis-lat',
      cubicInterpolationMode,
      borderWidth,
      pointRadius,
      lineTension
    },
    {
      label: '95th',
      backgroundColor: color(colors.orange).alpha(0.5).lighten(0.5).rgbString(),
      borderColor: colors.orange,
      fill: false,
      data: n95Data,
      yAxisID: 'y-axis-lat',
      cubicInterpolationMode,
      borderWidth,
      pointRadius,
      lineTension
    },
    {
      label: '99th',
      backgroundColor: color(colors.purple).alpha(0.5).lighten(0.5).rgbString(),
      borderColor: colors.purple,
      fill: false,
      data: n99Data,
      yAxisID: 'y-axis-lat',
      cubicInterpolationMode,
      borderWidth,
      pointRadius,
      lineTension
    },
    {
      label: 'RPS',
      backgroundColor: color(colors.grey).alpha(0.5).lighten(0.1).rgbString(),
      borderColor: colors.grey,
      fill: false,
      data: rpsData,
      yAxisID: 'y-axis-rps',
      cubicInterpolationMode,
      borderWidth,
      pointRadius,
      lineTension
    }
  ]

  const labelStr = `Latency (${unit})`

  var config = {
    type: 'bar',
    data: {
      labels: languages,
      datasets: datasets
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Comparaison of multiple languages'
      },
      tooltips: {
        mode: 'index',
        intersect: true
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Benchmark'
            },

          }
        ],
        yAxes: [
          {
            display: true,
            position: 'left',
            id: 'y-axis-lat',
            scaleLabel: {
              display: true,
              labelString: labelStr
            }
          },
          {
            type: 'linear',
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'RPS'
            },
            position: 'right',
            id: 'y-axis-rps',
            // grid line settings
            gridLines: {
              drawOnChartArea: false // only want the grid lines for one axis to show up
            }
          }
        ]
      }
    }
  }

  return config
}




module.exports = {
  createChartData,
  createLineChart
}
