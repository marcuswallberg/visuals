//////////////////////
// GLOBLA VARIABLES //
const w = 1400;
const h = 650;
let startTime = 0;
let endTime = 0;
let SLIDER_MIN = 0;
let SLIDER_MAX = SLIDER_MIN + 1000;
var settings = {
  radius: 2,
  selectRadius: 2,
  lineWidth: 2,
  opacity: 1,
  color: "cluster",
  Start_Date: '2018-01-01T12:00',
  End_Date: '2018-01-01T12:00',
  UPDATE_DATES: function() {
    const start = new Date(settings.Start_Date).valueOf() / 1000;
    const end = new Date(settings.End_Date).valueOf() / 1000;
    if (start < end)  {
      deleteSliders();
      let dateRangeIndex = getIndexRange(settings.Start_Date, settings.End_Date);
      outerFilterData = data.slice( dateRangeIndex[0], dateRangeIndex[1] );
      createSliders( parseInt(start), parseInt(end) );
      update();
    } else {
      alert('Your start date is after the end date');
    }
  }
}
let data = [];
let outerFilterData = [];
let topology = [];
// const PATH_TO_MAP = "http://www.csc.kth.se/~mwallb/exjobb/world110.json";
// const PATH_TO_CSV = "http://www.csc.kth.se/~mwallb/exjobb/position_label5.csv";
const PATH_TO_MAP = "../world110.json";
const PATH_TO_CSV = "../position_label_dbscan.csv";
// const PATH_TO_CSV = "http://127.0.0.1:3000/position_label_dbscan2.csv";
//////////////////////

//Create SVG element
let svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

// Create the settings tab
let gui = new dat.GUI();
gui.add(settings, "radius", 1, 6).onFinishChange( () => update() );
gui.add(settings, "selectRadius", 1, 4).onFinishChange( () => update() );
gui.add(settings, "lineWidth", 1, 6).onFinishChange( () => update() );
gui.add(settings, "opacity", 0, 1).onFinishChange( () => update() );
gui.add(settings, "color", ["cluster", "peak"]).onFinishChange( () => update() );
let folder = gui.addFolder('Date Range');
folder.add(settings, 'Start_Date').listen();
folder.add(settings, 'End_Date').listen();
folder.add(settings, 'UPDATE_DATES');

// Create a D3 scaler so the datapoints are scaled inside the SVG element
let xScale = d3.scaleLinear()  // xScale is width of graphic
let yScale = d3.scaleLinear()  // xScale is width of graphic

let projection = d3.geoMercator()
    .center([0, 9 ])
    .scale(3000)
    .rotate([0,0]);

let path = d3.geoPath()
    .projection(projection);

let g = svg.append("g");

// zoom and pan
let zoom = d3.zoom()
    .on("zoom",function() {
      // console.log(d3.event)
        g.attr("transform","translate("+ d3.event.transform.x + ',' + d3.event.transform.y + ")scale("+d3.event.transform.k+")");
        g.selectAll("circle")
            .attr("d", path.projection(projection));
        g.selectAll("path")  
            .attr("d", path.projection(projection)); 
});

svg
  .call(zoom);

// Does almost the same as the load function
function update() {
  // Clears the circles
  g.selectAll("circle")
    .remove();

  g.selectAll("path")
    .remove();

  const start = Math.round(SLIDER_MIN);
  const end = start + Math.round(SLIDER_MAX);

  let timeIndex = getIndexRange(start, end);
  // console.log(timeIndex);

  g.selectAll("path")
    .data(topojson.object(topology, topology.objects.countries).geometries)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke-width", parseInt(settings.lineWidth) )

  let filteredData = outerFilterData.slice( timeIndex[0], timeIndex[1] );
  g.selectAll("circle")
    .data(filteredData)
    .enter()
    .append("circle")
    .attr("cx", d => projection([d.long, d.lat])[0])
    .attr("cy", d => projection([d.long, d.lat])[1])
    .attr("id", d => "i" + d.id)
    .attr("title", toolTip)
    .attr("r", d => settings.radius )
    .attr("opacity", settings.opacity)
    .attr("class", d => "c" + Math.round(d.label))
    .attr("fill", d => selectColor(d))
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);
}

let peakScaler = d3.scaleSequential().domain([40, -50]).interpolator(d3['interpolateRdYlBu'])
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
    .attr("r", settings.radius * settings.selectRadius);
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
function init(error, inputData, data2) {
  data = inputData;
  topology = data2;

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
  settings.Start_Date = new Date( parseInt(startTime) * 1000 ).toISOString().substring(0, 24 - 5);
  settings.End_Date = new Date( parseInt(endTime) * 1000 ).toISOString().substring(0, 24 - 5);
  outerFilterData = data;
  createSliders(startTime, endTime);
  update();
}

// Load the data
d3.queue()
    .defer(d3.csv, PATH_TO_CSV) 
    .defer(d3.json, PATH_TO_MAP) 
    .await(init);



