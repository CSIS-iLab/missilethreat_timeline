// series is an array of objects
//    name - eventType (Intercept, Strike, Other)
//    data is an array of objects
//      name - monthYear
//      Y - # of event in m/y
//      drilldown - monthYear-eventType

// drilldown is an object
//    allowPointDrilldown - false (drilldown shows events for all categories in that month/year)
//    series is an array of objects
//      name - eventType+Headline+Text (Strike, Intercept, Other)
//      id - monthYear-eventType
//      data is an array of arrays
//        [day, # of events]

// Combine month+&+year
// Combine eventType+&+Headline+&+Text
// Combine month+&+year+&+eventType+Headline+Text
// If cell 11 contains YellowGreen, push to Intercept; else if call 11 contains IndianRed, push to strike; else push to other
//    {"name": eventType, "data": eventArray[eventType]}
//    name: monthYear; drilldown: monthYear+&+series name; y: +=1
// Push Intercept, Strike and Other objects to series array
// If cell 11 contains YellowGreen, push to Intercept; else if call 11 contains IndianRed, push to strike; else push to other
//    name: Strike, Intercept, Other; id: monthYear+&+series name;



var drilldownSeries = []
// Create empty array to push new event objects into
var series = []

Highcharts.data({
  // Load Data in from Google Sheets
  googleSpreadsheetKey: '1AKM59m3iaOSSQgVsIoDcSWxjcpX781JIuBwB9YdDgFs',
  googleSpreadsheetWorksheet: 1,
  switchRowsAndColumns: true,
  parsed: function parsed(columns) {
    // set default values
    var drilldown = ""
    var dataObject = { "intercept": {}, "strike": {}, "other": {} }
    var dataArray = []
    var drilldownObject = {}
    var event = ""

    columns.forEach(function (row, index) {
      // Skip first row
      if (index == 0) {
        return
      }
      // Get event value for this row
      var interceptColored = row[10].toLowerCase().indexOf("yellowgreen") > -1
      var strikeColored = row[10].toLowerCase().indexOf("indianred") > -1;
      if (interceptColored) {
        eventRow = 'intercept'
      } else if (strikeColored) {
        eventRow = 'strike'
      } else {
        eventRow = 'other'
      }
      // Get date as year month 01 for this row
      var seriesDate = new Date(row[0], row[1] - 1, '01').getTime()

      // Get date as year month day for this row
      var drilldownDate = new Date(row[0], row[1] - 1, row[2]).getTime()
      // Get the drilldown values for this row
      var drilldownRow = row[1] + '*' + row[0] + '*' + eventRow
      // var drilldownPointName = eventRow.toUpperCase() + " " + row[9] + " " + row[10]
      // If this event doesn't have this drilldown, create it
      if (!dataObject[eventRow][drilldownRow]) {
        dataObject[eventRow][drilldownRow] = {
          "y": 0,
          "drilldown": drilldownRow,
          "name": seriesDate,
          "x": seriesDate,
        }
      }
      // Increase value of y for every instance of the drilldown within the event object
      dataObject[eventRow][drilldownRow].y += 1

      // populate drilldown series
      if (!drilldownObject[drilldownRow]) {
        drilldownObject[drilldownRow] = {
          "name": eventRow,
          "id": drilldownRow,
          "data": []
        }
      }
      drilldownObject[drilldownRow].data.push({
        "x": drilldownDate,
        "y": 1,
        "toolHeader": row[9],
        "toolText": row[10]
      })
    })
    // Correct formatting
    // Create array of event types
    var seriesNames = Object.keys(dataObject)
    // Create arrays of the data for each event
    dataArray = Object.values(dataObject)
    for (var i = 0; i < dataArray.length; i++) {
      // Remove extra object level
      var dataPoints = Object.values(dataArray[i])
      // Push event name and reformatted data objects to series
      series.push({ name: seriesNames[i], data: dataPoints })
    }
    // Remove extra object level
    drilldown = Object.values(drilldownObject)

    console.log(drilldown)
    console.log(series)

    renderChart(series, drilldown)
  }
})

function renderChart(series, drilldown) {

  // format drillup button
  Highcharts.setOptions({
    lang: {
      drillUpText: "◁ Back to Main"
    },
  })
  Highcharts.chart('hcContainer', {
    // General Chart Options
    chart: {
      type: 'column'
    },
    // Chart Title and Subtitle
    title: {
      text: "Interactive Timeline"
    },
    subtitle: {
      text: "Click on a bar to see individual events in that month"
    },
    // Credits
    credits: {
      enabled: true,
      href: false,
      text: "CSIS Missile Threat"
    },
    // Chart Legend
    legend: {
      title: {
        text: 'Legend Title<br/><span style="font-size: 12px; color: #808080; font-weight: normal">(Click to hide)</span>'
      },
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal'
    },
    // X axis
    xAxis: {
      type: 'datetime',
      // labels: {
      //   format: '{value:%b \ %Y}'
      // }
    },
    // Y Axis
    yAxis: {
      title: {
        text: "Y Axis Title"
      },
    },
    // Additional Plot Options
    plotOptions:
    {
      column: {
        stacking: "normal", // Normal bar graph
        // stacking: "normal", // Stacked bar graph
        dataLabels: {
          enabled: false,
        },
      }
    },
    series: series,
    drilldown: {
      allowPointDrilldown: false,
      series: drilldown
    },
    tooltip: {
      formatter: function () {
        var dateObj = new Date(this.x)
        date = dateObj.toDateString()
        return date + ' - ' + this.point.toolHeader + '<br />' + this.point.toolText
      }
    }
  })
}
