var additionalOptions = {
  start_at_end: "false",
  start_at_slide: "4",
  timenav_height: "300",
  initial_zoom: "0"
};

const spreadsheetID = "1AKM59m3iaOSSQgVsIoDcSWxjcpX781JIuBwB9YdDgFs";

const timelineURL =
  "https://spreadsheets.google.com/feeds/list/" +
  spreadsheetID +
  "/1/public/values?alt=json";

fetch(timelineURL)
  .then(resp => resp.json())
  .then(json => {
    var timeline_json = parseJson(json.feed.entry);
    window.timeline = new TL.Timeline(
      "timeline-embed",
      timeline_json,
      additionalOptions
    );
  });

function parseJson(json) {
  let data = json.map(r => {
    let row = r;
    let rowData = {};

    Object.keys(row).forEach((c, i) => {
      let column = c;
      if (column.indexOf("gsx$") > -1) {
        let columnName = column.replace("gsx$", "");
        rowData[columnName] = row[column]["$t"];
      }
    });

    let interceptColored =
      rowData.text.toLowerCase().indexOf("yellowgreen") > -1;
    let interceptTexted = rowData.text.toLowerCase().indexOf("intercept") > -1;
    let strikeColored = rowData.text.toLowerCase().indexOf("indianred") > -1;
    let strikeTexted = rowData.text.toLowerCase().indexOf("strike") > -1;

    let eventData = {
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
      unique_id: `${
        strikeColored && strikeTexted
          ? `strike`
          : interceptColored && interceptTexted
            ? `intercept`
            : `none`
      }`
    };

    return eventData;
  });

  return { title: data[0], events: data.slice(1) };
}
