//// This gets the original data set ////

var dataObj;
var dataURL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";

d3.json(dataURL, function(error,json){
  dataObj = json;
  var data = dataObj.data;
  buildChart(data);
});

//// This is the callback function in the JSON request ////

function buildChart(data) {
  
  //// This sets up the SVG chart dimensions ////
  
  var margin = {top: 20, right: 20, bottom: 80, left: 120};
  var chartWidth = 1000;
  var chartHeight = 600;
  var contWidth = chartWidth - margin.left - margin.right;
  var contHeight = chartHeight - margin.top - margin.bottom;
  var numEntries = data.length;
  var barWidth = contWidth / numEntries;

  function getMax(data) {
    var max = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i][1] > max) {max = data[i][1];}
    }
    return max;
  };
  var maxValue = getMax(data);

  //// This uses D3 to develop a linear scale (function) for sizing the bars relative to the chart height ////

  var barHeight = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, contHeight]);

  //// This sets the scales of the axes ////

  var xAxisScale = d3.scale.linear()
      .domain([1947,2015.5])
      .range([0,contWidth]);

  var yAxisScale = d3.scale.linear()
      .domain([0,maxValue])
      .range([contHeight,0]);

  var xAxis = d3.svg.axis()
      .scale(xAxisScale)
      .ticks(20)
      .tickFormat(d3.format(""))
      .tickPadding(10)
      .orient("bottom");
    
  var yAxis = d3.svg.axis()
      .scale(yAxisScale)
      .ticks(20)
      .tickPadding(10)
      .orient("left");

  //// This selects the SVG with D3 and sets its size using a viewBox rather than absolute height and width. This allows the SVG to resize on the page, and everything within the SVG will adjust accordingly. This then adds axes and axis labels ////

  var chart = d3.select(".chart")
      .attr("viewBox", "0 0 " + chartWidth + " " + chartHeight);

  chart.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + margin.left + "," + (contHeight + margin.top) + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(yAxis);

  chart.append("text")
      .attr("class", "axisLabel")
      .attr("x", 500)
      .attr("y", contHeight + margin.top + margin.bottom - 20)
      .text("Year");

  chart.append("text")
      .attr("class", "axisLabel")
      .attr("x", -(contWidth/3 + 50))
      .attr("y", 30)
      .attr("transform", "rotate(-90)")
      .text("USA GDP ($ billion)");

  //// This adds a group (bar) for each item in the data array, appending one if it doesn't exist, and it positions the group in space based on the bar width and height ////

  var bar = chart.selectAll(".barGroup")
      .data(data)
      .enter().append("g")
      .attr("class", "barGroup")
      .attr("transform", function(d, i) { 
        return "translate(" + (i * barWidth + margin.left) + "," + (contHeight - barHeight(d[1]) + margin.top) + ")"; 
      });

  //// This then appends a rectangle element and a text box to each group and sizes them ////

  bar.append("rect")
      .attr("class", "bars")
      .attr("width", barWidth)
      .attr("height", function(d) {
        return barHeight(d[1]);
      });

  bar.append("text")
      .attr("class", "labels")
      .text(function(d) {
        var date = d[0].split("-");
        var year = parseInt(date[0]);
        var monthNum = parseInt(date[1]);
        var monthStr = "";
        var monthStr = monthConvert(monthNum);
        return monthStr + ', ' + year + ': ' + d[1]; 
      });

  bar.append("title")
      .text(function(d) {
        var date = d[0].split("-");
        var year = parseInt(date[0]);
        var monthNum = parseInt(date[1]);
        var monthStr = monthConvert(monthNum);
        return monthStr + ', ' + year + ': ' + d[1]; 
      });
    
  //// This is the function that's used to get a month string ////

  function monthConvert(num) {
    var month = "";
    switch (num) {
      case 1:
        month = "Jan";
        break;
      case 2:
        month = "Feb";
        break;
      case 3:
        month = "Mar";
        break;
      case 4:
        month = "Apr";
        break;
      case 5:
        month = "May";
        break;
      case 6:
        month = "Jun";
        break;
      case 7:
        month = "Jul";
        break;
      case 8:
        month = "Aug";
        break;
      case 9:
        month = "Sep";
        break;
      case 10:
        month = "Oct";
        break;
      case 11:
        month = "Nov";
        break;
      case 12:
        month = "Dec";
        break;
      }
    return month;
  }

  //// These are the mouse and click events that will add interactivity to the chart ////

  var mouseOn = function(event) {
    var group = event.target.parentNode;
    var groupClass = group.getAttribute("class");
    if (groupClass == "barGroup") {
      var rectRef = group.childNodes[0];
      var textRef = group.childNodes[1];
      rectRef.style.fill = '#3b3738';
      textRef.style.visibility = "visible";
    }
  }

  var mouseOff = function(event) {
    var group = event.target.parentNode;
    var groupClass = group.getAttribute("class");
    if (groupClass == "barGroup") {  
      var rectRef = group.childNodes[0];
      var textRef = group.childNodes[1];
      rectRef.style.fill = '#c63d0f';
      textRef.style.visibility = "hidden";
    }
  }

  //// This binds the click and mouse events to the chart, and it captures the events via bubbling ////

  var chart = document.getElementsByClassName('chart');
  chart[0].onmouseover = mouseOn;
  chart[0].onmouseout = mouseOff;
}