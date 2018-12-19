//// This sets the paths to the data sources ////

var mapURL = "https://d3js.org/world-110m.v1.json";
var dataURL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";

//// This sets up the SVG chart dimensions ////
  
var chartWidth = 800;
var chartHeight = 400;

var chart = d3.select(".chart")
    .attr("viewBox", "0 0 " + chartWidth + " " + chartHeight);

//// This sets up the basic map systems ////

var proj = d3.geo.orthographic()
    .scale(chartHeight/2)
    .translate([chartWidth/2,chartHeight/2])
    .clipAngle(90);

var path = d3.geo.path()
    .projection(proj);

//// This maps a sphere to the same space as the rest of the map data, so that it can fill the oceans. It then creates the map group for placing the map features ////

var ocean = chart.append("path")
    .datum({type: "Sphere"})
    .attr("class","ocean")
    .attr("d",path);

var map = chart.append('g');

//// This is the function that builds the map ////

function buildMap(topology) {
  var features = map.selectAll(".mapFeatures")
      .data(topojson.feature(topology, topology.objects.countries).features)
      .enter().append("path")
      .attr("class","mapFeatures")
      .attr("d", path);
}

//// These are the functions that build the meteorite layer ////

var ptPath = d3.geo.path()
    .projection(proj)
    .pointRadius(function(d) {
      var size = Math.sqrt(d.properties.mass)/80;
      if (size < 2) {size = 2;}
      if (size > 50) {size = 50;}
      return size;
    });

function showPoints(strikes) {
  var points = map.selectAll(".points")
      .data(strikes.features)
      .enter().append("path")
      .attr("class","points")
      .attr("d",ptPath);
  
  points.append("title")
      .text(function(d) {
        return d.properties.name;
      })
}

//// This builds a textbox as a foreign object, and is applied after the data points are all on the map ////

function buildText() {
  chart.append("foreignObject")
      .attr("id","tooltip")
      .attr("width",100)
      .attr("height",100)  
      .attr("x",100)
      .attr("y",5)
      .append("xhtml:div")
      .attr("id","textbox")
      .html("Hover over symbols for details");
}

//// This function creates buttons for zooming in and zooming out. It's called last so that the buttons will always be on top of the map items ////

function buildButtons() {
  var zoomIn = chart.append("g")
      .attr("class","btnGp")
      .attr("transform","translate(5,5)")
      .on("click", function() {
        var amount = 0.2;
        zoom(amount);
      });

  zoomIn.append("rect")
      .attr("id", "zoomIn")
      .attr("class", "button")
      .attr("width", 80)
      .attr("height", 30);

  zoomIn.append("text")
      .attr("class", "btnText")
      .attr("x", 32)
      .attr("y", 24)
      .text("+");

  var zoomOut = chart.append("g")
      .attr("class","btnGp")
      .attr("transform","translate(5,40)")
      .on("click", function() {
        var amount = -0.2;
        zoom(amount);
      });

  zoomOut.append("rect")
      .attr("id", "zoomOut")
      .attr("class", "button")
      .attr("width", 80)
      .attr("height", 30);

  zoomOut.append("text")
      .attr("class", "btnText")
      .attr("x", 35)
      .attr("y", 20)
      .text("-");

}

//// This is the function that allows spinning the globe ////
//// This code was modified after "bl.ocks.org/KoGor/5994804" ////

var sensitivity = 0.5;

var spin = d3.behavior.drag()
    .origin(function() {
      var r = proj.rotate();
      return {x: r[0]/sensitivity, y: -r[1]/sensitivity};
    })
    .on("drag", function() {
      var rotate = proj.rotate();
      proj.rotate([d3.event.x * sensitivity, -d3.event.y * sensitivity, rotate[2]]);
      chart.selectAll(".mapFeatures").attr("d", path);
      chart.selectAll(".points").attr("d", ptPath);
    });

//// This is the function that allows zooming ////

var scale = 1;

function zoom(amount) {
  scale = scale + amount;
  var xCenter = (chartWidth/2);
  var yCenter = (chartHeight/2);
  var xAdj = -(scale-1)*xCenter;
  var yAdj = -(scale-1)*yCenter;
  map.attr("transform","translate(" + xAdj + "," + yAdj + ")scale(" + scale + ")");
  ocean.attr("transform","translate(" + xAdj + "," + yAdj + ")scale(" + scale + ")");
  
  ptPath.pointRadius(function(d) {
    var size = Math.sqrt(d.properties.mass)/80;
    if (size < 2) {size = 2;}
    if (size > 50) {size = 50;}
    var reduce = 0;
    if (scale > 1) {factor = 1*(scale-1) + 1;}
    else {factor = 0*(scale-1) + 1;}
    return size / factor;
  });
  chart.selectAll(".points").attr("d", ptPath);
};

//// This creates and binds the mouseover event that gives more information ////

function bindMouseEvents() {
  var mouseOn = function(event) {
    var group = event.target;
    var groupClass = group.getAttribute("class");
    var textbox = document.getElementById("textbox");
    if (groupClass == "points") {
      var data = group.__data__;
      var year = "";
      var mass = "";
      var type = "";
      if (data.properties.year) {year = data.properties.year.substr(0,4);}
      if (data.properties.mass) {mass = data.properties.mass;}
      if (data.properties.recclass) {type = data.properties.recclass;}
      var contents = data.properties.name + "<br>Year: " + year + "<br>Mass: " + parseInt(mass) + "<br>Class: " + type;
      textbox.innerHTML = contents;
    } else {
      textbox.innerHTML = "Hover over symbols for details";
    }
  }

  var chart = document.getElementsByClassName('chart');
  chart[0].onmouseover = mouseOn;
}

//// This gets the data and calls the functions in order ////

d3.json(mapURL, function(error, topology) {
  buildMap(topology);
  d3.json(dataURL, function(error, strikes) {
    showPoints(strikes);
    buildText();
    buildButtons();
    bindMouseEvents();
    chart.call(spin);
  });
});

//// End of Script ////
