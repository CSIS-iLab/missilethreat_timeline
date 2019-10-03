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

var dataRoot = {
  'series': [],
  'drilldown': []
}


Highcharts.chart('hcContainer', {
  // Load Data in from Google Sheets
  data: {
    googleSpreadsheetKey: '1AKM59m3iaOSSQgVsIoDcSWxjcpX781JIuBwB9YdDgFs',
    googleSpreadsheetWorksheet: 1,
    switchRowsAndColumns: true,
    parsed: function parsed(columns) {
      // set default values
      var drilldown = ""
      var dataArray = { "intercept": {}, "strike": {}, "other": {} }
      var drilldownArray = []
      var event = ""
      var totalItems = columns.length

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
        // Get the drilldown value for this row
        var drilldownRow = row[1] + '*' + row[0] + '*' + eventRow
        // Populate dataArray
        // dataArray[eventRow].push({
        //   "y": + 1,
        //   "drilldown": drilldownRow,
        //   "name": drilldownRow
        // })
        if (!dataArray[eventRow][drilldownRow]) {
          dataArray[eventRow][drilldownRow] = {
            "y": 0,
            "drilldown": drilldownRow,
            "name": drilldownRow
          }
        }
        dataArray[eventRow][drilldownRow].y += 1


        if (drilldown != drilldownRow) {
          if (index == 1) {
            // Update drilldown value
            drilldown = drilldownRow
          }
          else {
            // Push data to dataRoot drilldown
            dataRoot.drilldown.push({
              "allowPointDrilldown": false,
              name: eventRow.toUpperCase() + " " + row[9] + " " + row[10],
              id: drilldownRow + '*' + eventRow,
              data: drilldownArray
            })
          }
          // Empty drilldown array
          drilldownArray = []

          // Update drilldown value
          drilldown = drilldownRow
          drilldownArray.push([row[2], 1])
        }


      })
      dataRoot.series = dataArray
      console.log(dataRoot)

    }





  },
  // // General Chart Options
  // chart: {
  //   zoomType: 'x',
  //   type: 'column'
  // },
  // // Chart Title and Subtitle
  // title: {
  //   text: "Interactive Title"
  // },
  // subtitle: {
  //   text: "Click and drag to zoom in"
  // },
  // // Credits
  // credits: {
  //   enabled: true,
  //   href: false,
  //   text: "CSIS Project Name | Source: NAME"
  // },
  // // Chart Legend
  // legend: {
  //   title: {
  //     text: 'Legend Title<br/><span style="font-size: 12px; color: #808080; font-weight: normal">(Click to hide)</span>'
  //   },
  //   align: 'center',
  //   verticalAlign: 'bottom',
  //   layout: 'horizontal'
  // },
  // // Y Axis
  // yAxis: {
  //   title: {
  //     text: "Y Axis Title"
  //   },
  // },
  // // Additional Plot Options
  // plotOptions:
  // {
  //   column: {
  //     stacking: normal, // Normal bar graph
  //     // stacking: "normal", // Stacked bar graph
  //     dataLabels: {
  //       enabled: false,
  //     }
  //   }
  // }
})
