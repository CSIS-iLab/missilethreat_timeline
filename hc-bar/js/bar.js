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

var drilldownSeries = [];
// Create empty array to push new event objects into
var series = [];

Highcharts.data({
  // Load Data in from Google Sheets
  googleSpreadsheetKey: "1AKM59m3iaOSSQgVsIoDcSWxjcpX781JIuBwB9YdDgFs",
  googleSpreadsheetWorksheet: 1,
  switchRowsAndColumns: true,
  parsed: function parsed(columns) {
    // set default values
    var drilldown = "";
    var dataObject = { other: {}, strike: {}, intercept: {} };
    var dataArray = [];
    var drilldownObject = {};
    var event = "";

    columns.forEach(function (row, index) {
      // Skip header row and title row
      if (index == 0 || index == 1) {
        return;
      }
      // Get event value for this row
      var interceptColored = row[10].toLowerCase().indexOf("yellowgreen") > -1;
      var strikeColored = row[10].toLowerCase().indexOf("indianred") > -1;
      if (interceptColored) {
        eventRow = "intercept";
      } else if (strikeColored) {
        eventRow = "strike";
      } else {
        eventRow = "other";
      }
      // Remove links from the text that will appear in the tooltip
      var eventText = row[10].substr(0, row[10].indexOf("<a "));
      // var eventText = row[10]
      // Get series date as year month 01 for this row
      var seriesDate = new Date(row[0], row[1] - 1, "01").getTime();
      // Get drilldown date as year month day for this row
      var drilldownDate = new Date(row[0], row[1] - 1, row[2]).getTime();
      // Get the drilldown value for this row
      var drilldownRow = row[1] + "*" + row[0] + "*" + eventRow;
      // If this event doesn't have this drilldown, create it
      if (!dataObject[eventRow][drilldownRow]) {
        dataObject[eventRow][drilldownRow] = {
          y: 0,
          drilldown: drilldownRow,
          name: seriesDate,
          x: seriesDate
        };
      }
      // Increase value of y for every instance of the drilldown within the event object
      dataObject[eventRow][drilldownRow].y += 1;

      // populate drilldown series
      if (!drilldownObject[drilldownRow]) {
        drilldownObject[drilldownRow] = {
          name: eventRow,
          id: drilldownRow,
          data: [],
          // "xAxis": 1,
          yAxis: 1,
          pointWidth: 20,
          pointRange: 1
        };
      }
      // Populate drilldown data
      drilldownObject[drilldownRow].data.push({
        x: drilldownDate,
        y: 1,
        toolHeader: row[9],
        toolText: eventText
      });
    });
    // Correct formatting
    // Create array of event types
    var seriesNames = Object.keys(dataObject);
    // Create arrays of the data for each event
    dataArray = Object.values(dataObject);
    for (var i = 0; i < dataArray.length; i++) {
      // Remove extra object level
      var dataPoints = Object.values(dataArray[i]);
      // Get series color based on event type
      var eventColor = "";
      if (seriesNames[i] == "intercept") {
        eventColor = "#9acd32";
        // Use this for icon pattern fill
        // eventColor = {
        //   pattern: {
        //     image: "../intercept.png",
        //     width: 20,
        //     height: 20,
        //     x: 1.5,
        //     y: 2
        //   }
        // }
      } else if (seriesNames[i] == "strike") {
        eventColor = "#954950";
        // Use this for icon pattern fill
        // eventColor = {
        //   pattern: {
        //     image: "../STRIKE.png",
        //     width: 15,
        //     height: 15,
        //     x: 1,
        //     y: 4
        //   }
        // }
      } else {
        eventColor = "#BEBDC0";
      }
      // Push event name and reformatted data objects to series
      series.push({
        name: seriesNames[i],
        data: dataPoints,
        xAxis: 0,
        yAxis: 0,
        color: eventColor
      });
    }
    // Remove extra object level
    drilldown = Object.values(drilldownObject);
    renderChart(series, drilldown);
  }
});

function renderChart(series, drilldown) {
  // Remove link in x axis titles
  Highcharts.Tick.prototype.drillable = function () { }

  // format drillup button
  Highcharts.setOptions({
    lang: {
      drillUpText: "◁ Back to Main"
    },
    global: {
      useUTC: false
    },
  });
  Highcharts.chart("hcContainer", {
    // General Chart Options
    chart: {
      type: "column",
      events: {
        // On drilldown remove yAxis title and format x axis labels
        drilldown: function (e) {
          this.yAxis[0].setTitle({ text: undefined })
          const date = new Date(e.category)
          let firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
          let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          this.xAxis[0].update({
            labels: {
              format: "{value:%e}",
              rotation: 0,
            },
            softMin: firstDay.getTime(),
            softMax: lastDay.getTime(),
            minPadding: 0.02,
            maxPadding: 0.02,
            tickInterval: 24 * 3600 * 1000,
            title: {
              enabled: true,
              text: date.toLocaleString(`default`, { month: `long` }) + " " + date.getFullYear(),
            }
          })
        },
        // On drillup set yAxis title
        drillup: function (e) {
          this.yAxis[0].setTitle({ text: "Reported Incidents" });
          const firstDate = new Date(e.target.xAxis[0].dataMin);
          const lastDate = new Date(e.target.xAxis[0].dataMax);
          let firstDay = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
          let lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0);
          this.xAxis[0].update({
            labels: {
              format: "{value:%b %Y}",
              rotation: 90,
            },
            tickInterval: 140 * 24 * 3600 * 1000,
            title: {
              enabled: false
            }
          });
        }
      },
    },
    exporting: {
      chartOptions: {
        subtitle: {
          text: ""
        },
        // credits: {
        //   enabled: true,
        //   href: false,
        //   text: "MissileThreat.CSIS.org"
        // }
      }
    },
    // Chart Title and Subtitle
    title: {
      text: "<b>The Missile War in Yemen</b>",
      style: {
        fontFamily: '"Open Sans Pro", Helvetica, sans-serif;',
        fontSize: 30,
      },
    },
    subtitle: {
      text:
        'Interactive Timeline<br/>Click on a bar to see individual events in a month<br/><a href="https://docs.google.com/spreadsheets/d/1ZY_g-shtct4IJZQFiFdIp-DZ7WXAL4IssWmMaKZRsb4/edit?usp=sharing" className="dataLink">Download data in spreadsheet</a>',
      useHTML: true,
    },
    // Credits
    credits: {
      enabled: false,
      href: false,
      text: "CSIS Missile Threat"
    },
    // Chart Legend
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
      reversed: true,
      labelFormatter: function () {
        var category = this.name.charAt(0).toUpperCase() + this.name.slice(1);
        return category;
      },
      itemStyle: {
        cursor: "default"
      }
    },
    // X axis default
    xAxis: [
      {
        type: "datetime",
        tickInterval: 140 * 24 * 3600 * 1000,
        labels: {
          format: "{value:%b %Y}",
          rotation: 90
        },
      }
    ],
    // Y Axis drilled up
    yAxis: [
      {
        // Set default title
        title: {
          text: "Reported Incidents"
        }
      },
      // Y axis drilled down
      {
        // Removes y axis lines
        visible: false
      }
    ],
    // Additional Plot Options
    plotOptions: {
      column: {
        stacking: "normal", // Normal bar graph
        // stacking: "normal", // Stacked bar graph
        dataLabels: {
          enabled: false
        },
        events: {
          legendItemClick: function () {
            return false; // cancel the default hide series action
          }
        }
      },
      series: {
        borderRadius: 2
      }
    },
    series: series,
    drilldown: {
      // Setting this to false makes all points for all series in column show on drilldown
      allowPointDrilldown: false,
      series: drilldown,
      drillUpButton: {
        position: { align: "right", y: -60, x: 5 }
      }
    },
    tooltip: {
      useHTML: true,
      outside: true,
      formatter: function () {
        // Convert unix timestamp to javascript date
        var dateObj = new Date(this.x);
        // Remove time portion of date
        var date = dateObj.toDateString();
        // Convert date to array
        var dateArray = date.split(" ");
        // Create variable showing month and year
        var monthYear = dateArray[1] + " " + dateArray[3];
        // Format drilled up tooltip
        if (this.point.drilldown) {
          // Convert drilldown name to array
          var categorySplit = this.point.drilldown.split("*");
          // Isolate and capitalize the event category
          var category =
            categorySplit[2].charAt(0).toUpperCase() +
            categorySplit[2].slice(1);
          // Display Month/Year, Category and y value
          return "<b>" + monthYear + "</b >" + " " + category + ": " + this.y;
        }
        // Format drilled down tooltip
        else {
          return (
            date +
            " - <b>" +
            this.point.toolHeader +
            "</b><br/>" +
            this.point.toolText
          );
        }
      }
    },
  },
    function (chart) {
      let top = chart.plotTop + chart.plotHeight + 85,
        left = chart.plotLeft + chart.plotWidth - 345;
      let image = chart.renderer.image('./MissileDefense.png', left, top, 340, 30)
      image.add()
    }
  )
}

