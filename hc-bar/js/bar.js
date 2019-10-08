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
      // Remove links from the text that will appear in the tooltip
      var eventText = row[10].substr(0, row[10].indexOf('<a '))
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
          "data": [],
          "xAxis": 1,
          "yAxis": 1
        }
      }
      // Populate drilldown data
      drilldownObject[drilldownRow].data.push({
        "x": drilldownDate,
        "y": 1,
        "toolHeader": row[9],
        "toolText": eventText
      })
    })
    // Correct formatting
    // Create array of event types
    var seriesNames = Object.keys(dataObject)
    console.log(seriesNames)
    // Create arrays of the data for each event
    dataArray = Object.values(dataObject)
    for (var i = 0; i < dataArray.length; i++) {
      // Remove extra object level
      var dataPoints = Object.values(dataArray[i])
      var eventColor = ""
      if (seriesNames[i] == "intercept") {
        eventColor = "#9acd32"
      }
      else if (seriesNames[i] == "strike") {
        eventColor = "#954950"
      }
      else {
        eventColor = "#E5E5E5"
      }
      // Push event name and reformatted data objects to series
      series.push({ name: seriesNames[i], data: dataPoints, xAxis: 0, yAxis: 0, color: eventColor })
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
      type: 'column',
      events: {
        drilldown: function (e) {
          this.yAxis[0].setTitle({ text: undefined })
        }
      }
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
        text: '<span style="font-size: 12px; color: #808080; font-weight: normal">(Click to hide)</span>'
      },
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      labelFormatter: function () {
        var category = this.name.charAt(0).toUpperCase() + this.name.slice(1)
        return category
      }
    },
    // X axis drilled up
    xAxis: [{
      type: 'datetime',
      labels: {
        format: '{value:%b %Y}'
      },
      startOnTick: true,
    },
    // X axis drilled down
    {
      type: 'datetime',
      labels: {
        format: '{value:%b/%e/%Y}',
        rotation: -45
      },
    }],
    // Y Axis drilled up
    yAxis: [{
      title: {
        text: "Monthly Activity"
      },
    },
    // Y axis drilled down
    {
      visible: false,
      showEmpty: true,
      title: {
        enabled: false
      }
    }],
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
      // Setting this to false makes all points in column show on drilldown
      allowPointDrilldown: false,
      series: drilldown,
    },
    tooltip: {
      formatter: function () {
        // Convert unix timestamp to javascript date
        var dateObj = new Date(this.x)
        // Remove time portion of date
        var date = dateObj.toDateString()
        // Convert date to array
        var dateArray = date.split(" ")
        // Create variable showing month and year
        var monthYear = dateArray[1] + " " + dateArray[3]
        // Format drilled up tooltip
        if (this.point.drilldown) {
          // Convert drilldown name to array
          var categorySplit = this.point.drilldown.split("*")
          // Isolate and capitalize the event category
          var category = categorySplit[2].charAt(0).toUpperCase() + categorySplit[2].slice(1)
          // Display Month/Year, Category and y value
          return monthYear + '<br />' + category + ': ' + this.y
        }
        // Format drilled down tooltip
        else {
          return date + ' - ' + this.point.toolHeader + '<br />' + this.point.toolText
        }
      }
    }
  })
}
