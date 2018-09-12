let sliderValue = "";
let slider = "";
let sliderValue2 = "";
let sliderRange = "";

function createSliders( DATA_MIN, DATA_MAX ) {
  slider1InitValue = DATA_MIN;
  slider2InitValue = 7200;

  console.log(DATA_MIN, DATA_MAX);

  // First slider
  sliderValue = d3.select("body")
    .append("div")
    .append("span")
    .text(new Date(parseInt(outerFilterData[0].seconds) * 1000))
    .attr("id", "slide");
  // Create slider

  slider = d3.select("body")
    .append("div")
    .append("input")
    .classed("slider", true)
    .attr("type", "range")
    .attr("min", DATA_MIN)
    .attr("max", DATA_MAX)
    .attr("value", slider1InitValue)
    .on("input", function() {
      SLIDER_MIN = this.value;
      d3.select("#slide")
        .text(new Date(parseInt(this.value) * 1000));
      update();
    });

  // Range slider
  sliderValue2 = d3.select("body")
    .append("div")
    .append("span")
    .text(secondsToHours(slider2InitValue))
    .attr("id", "slide2");
    
  sliderRange = d3.select("body")
    .append("div")
    .append("input")
    .classed("slider", true)
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", 3600 * 72)
    .attr("value", slider2InitValue)
    .on("input", function() {
      SLIDER_MAX = this.value;
      d3.select("#slide2")
        .text(secondsToHours(this.value));
      update();
    });
}

function deleteSliders() {
  sliderValue.remove();
  slider.remove();
  sliderValue2.remove();
  sliderRange.remove();
}

function secondsToHours(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - (3600 * hours)) / 60);
  const second = Math.floor(seconds - 3600 * hours - 60 * minutes)
  return hours.toString() + " Hours " + minutes.toString() + " Minutes " + second.toString() +" Seconds ";
}

/////////////////////////////////
// Will maybe integrate the D3 //
// slider later                //
/////////////////////////////////

// let startTimeSlider = d3.slider()
//   .min(0)
//   .max(1)
//   .step(1)
//   .value(0)
//   .on("slide", function (event, value) {
//     SLIDER_MIN = this.value;
//     d3.select("#slide")
//       .text(this.value);
//     filter();
//   })