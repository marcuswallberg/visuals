//////////////////////
// GLOBLA VARIABLES //
const w = 1000;
const h = 650;
let startTime = 0;
let endTime = 0;
let SLIDER_MIN = 0;
let SLIDER_MAX = SLIDER_MIN + 1000;
var settings = {
  radius: 2,
  opacity: 1,
  color: "cluster",
  UPDATE: function() {
    update();
  }
}
let data = [];
const PATH_TO_CSV = "http://127.0.0.1:3000/position_label_dbscan.csv";
// const PATH_TO_CSV = "http://www.csc.kth.se/~mwallb/exjobb/position_label5.csv";
// const PATH_TO_CSV = "http://130.229.129.56:3000/position_label_dbscan.csv";
// let PATH_TO_CSV = "http://www.csc.kth.se/~mwallb/exjobb/position_label.csv";
//////////////////////

//Create SVG element
let svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

// Create the settings tab
let gui = new dat.GUI();
gui.add(settings, "radius", 1, 6).onFinishChange( () => update() );
gui.add(settings, "opacity", 0, 1).onFinishChange( () => update() );
gui.add(settings, "color", ["cluster", "peak"]).onFinishChange( () => update() );
// gui.add(settings, "UPDATE");

// Create a D3 scaler so the datapoints are scaled inside the SVG element
let xScale = d3.scaleLinear()  // xScale is width of graphic
let yScale = d3.scaleLinear()  // xScale is width of graphic

// Does almost the same as the load function
function update() {
  // Clears the circles
  svg.selectAll("circle")
    .remove();

  const start = Math.round(SLIDER_MIN);
  const end = start + Math.round(SLIDER_MAX);

  timeIndex = getIndexRange(start, end);
  // console.log(timeIndex);

  let filteredData = data.slice( timeIndex[0], timeIndex[1] );
  svg.selectAll("circle")
    .data(filteredData)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.long))
    .attr("cy", d => yScale(d.lat))
    .attr("id", d => "i" + d.id)
    .attr("title", toolTip)
    .attr("r", d => settings.radius )
    .attr("opacity", settings.opacity)
    .attr("class", d => "c" + Math.round(d.label))
    .attr("fill", d => selectColor(d))
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);
}

let peakScaler = d3.scaleSequential().domain([-50, 40]).interpolator(d3['interpolateRdYlBu'])
function selectColor(d) {
  if (settings.color == "cluster") {
    return Colors.get(d.label)
  } 
  else if (settings.color == "peak") {
    return peakScaler(d.peak)
  }
}

// Handle the mouse events:
function handleMouseOver(d, i) {  // Add interactivity
  // Use D3 to select element, change color and size
  const point = d3.select(this);
  const c = "." + point.attr("class");
  d3.selectAll(c)
    .attr("r", settings.radius * 3);
  point.classed("tool", true);

  // Adding a tooltip
  tippy('.tool', {
    theme: 'opacity'
  });
}

function handleMouseOut(d, i) {  // Add interactivity
  // Use D3 to select element, change color and size
  const point = d3.select(this);
  point.classed("tool", false);  
  const c = "." + point.attr("class");
  d3.selectAll(c)
    .attr("r", settings.radius);
}

// Tooltip info
function toolTip(d) {
  const label = "<i>Cluster:</i> " + d.label,
    peak = " <i>Peak</i>: " + d.peak,
    long = "<br>Longitude: " + d.long,
    lat = " Latitude: " + d.lat,
    time = "<br><i>Time:</i> " + new Date(parseInt(d.seconds) * 1000)
    return label + peak + time
}

// Returns the index in the data array for the 
// start and the end time in the selection
function getIndexRange( start, end ) {
  let startIndex = 0;
  let endIndex = 10000000000;
  let startSet = false;
  let endSet = false;
  for (let i = 0; i < data.length; i++) {
    let d = data[i];
    if (d.seconds >= start && startSet == false) {
      startSet = true;
      startIndex = i;
    } 
    else if (d.seconds >= end && endSet == false) {
      endSet = true;
      endIndex = i-1;
      break;
    }
  }
  return [startIndex, endIndex]
} 

// Calls this function once for getting the data. 
function init(error, inputData) {
  data = inputData;

  // Getting the min and max of the lat and long
  const minLong = d3.min(data, d => parseFloat(d.long));
  const maxLong = d3.max(data, d => parseFloat(d.long));
  const minLat = d3.min(data, d => parseFloat(d.lat));
  const maxLat = d3.max(data, d => parseFloat(d.lat));

  xScale
    .domain([minLong,maxLong])
    .range([0, w]); 
  yScale
    .domain([minLat,maxLat])
    .range([h, 0]);

  startTime = d3.min(data, d => d.seconds);
  endTime = d3.max(data, d => d.seconds);
  SLIDER_MIN = startTime;
  createSliders(startTime, endTime);
  update();
}

// Load the data
d3.queue()
    .defer(d3.csv, PATH_TO_CSV) 
    .await(init);



