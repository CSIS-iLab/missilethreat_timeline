"use strict";

var additionalOptions = {
  start_at_end: "false",
  start_at_slide: "4",
  timenav_height: "300",
  initial_zoom: "0"
};

var spreadsheetID = "1AKM59m3iaOSSQgVsIoDcSWxjcpX781JIuBwB9YdDgFs";

var timelineURL =
  "https://spreadsheets.google.com/feeds/list/" +
  spreadsheetID +
  "/1/public/values?alt=json";

fetch(timelineURL)
  .then(function(resp) {
    return resp.json();
  })
  .then(function(json) {
    var timeline_json = parseJson(json.feed.entry);
    window.timeline = new TL.Timeline(
      "timeline-embed",
      timeline_json,
      additionalOptions
    );
  });

function parseJson(json) {
  var data = json.map(function(r) {
    var row = r;
    var rowData = {};

    Object.keys(row).forEach(function(c, i) {
      var column = c;
      if (column.indexOf("gsx$") > -1) {
        var columnName = column.replace("gsx$", "");
        rowData[columnName] = row[column]["$t"];
      }
    });

    var interceptColored =
      rowData.text.toLowerCase().indexOf("yellowgreen") > -1;
    var interceptTexted = rowData.text.toLowerCase().indexOf("intercept") > -1;
    var strikeColored = rowData.text.toLowerCase().indexOf("indianred") > -1;
    var strikeTexted = rowData.text.toLowerCase().indexOf("strike") > -1;

    var eventData = {
      start_date: {
        day: rowData.day,
        format: "full",
        format_short: "full_short",
        month: rowData.month,
        year: rowData.year
      },
      text: {
        headline: rowData.headline,
        text: rowData.text
      },
      media: {
        // caption: rowData.caption,
        // credit: rowData.media_2,
        url: rowData.media
      },
      unique_id:
        "" +
        (strikeColored && strikeTexted
          ? "strike"
          : interceptColored && interceptTexted
            ? "intercept"
            : "none")
    };

    return eventData;
  });

  return { title: data[0], events: data.slice(1) };
}
