Highcharts.chart('hcContainer', {
  // Load Data in from Google Sheets
  data: {
    googleSpreadsheetKey: '1AKM59m3iaOSSQgVsIoDcSWxjcpX781JIuBwB9YdDgFs',
    googleSpreadsheetWorksheet: 2
  },
  // General Chart Options
  chart: {
    zoomType: 'x',
    type: 'column'
  },
  // Chart Title and Subtitle
  title: {
    text: "Interactive Title"
  },
  subtitle: {
    text: "Click and drag to zoom in"
  },
  // Credits
  credits: {
    enabled: true,
    href: false,
    text: "CSIS Project Name | Source: NAME"
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
      stacking: normal, // Normal bar graph
      // stacking: "normal", // Stacked bar graph
      dataLabels: {
        enabled: false,
      }
    }
  }
})
