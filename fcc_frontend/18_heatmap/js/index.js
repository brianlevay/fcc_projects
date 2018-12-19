//// This gets the data ////

var dataObj;
var dataURL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(dataURL, function(error,json){
  dataObj = json;
  buildMap();
});

//// This is the callback function used in the JSON request ////

function buildMap() {
  
  //// This sets up the SVG chart dimensions ////
  
  var margin = {top: 20, right: 20, bottom: 120, left: 80};
  var chartWidth = 800;
  var chartHeight = 400;
  var contWidth = chartWidth - margin.left - margin.right;
  var contHeight = chartHeight - margin.top - margin.bottom;
  var minYear = 1753;
  var maxYear = 2015;
  var minTempDiff = 0;
  var maxTempDiff = 0;

  function tempExtremes() {
    for (var i = 0; i < dataObj.monthlyVariance.length; i++) {
      if (dataObj.monthlyVariance[i].variance > maxTempDiff) {
        maxTempDiff = dataObj.monthlyVariance[i].variance;
      }
      if (dataObj.monthlyVariance[i].variance < minTempDiff) {
        minTempDiff = dataObj.monthlyVariance[i].variance;
      }
    }
  }
  tempExtremes();
  maxTempDiff = Math.ceil(maxTempDiff);
  minTempDiff = Math.floor(minTempDiff);

  //// This sets the various scales for the plot ////

  var xScale = d3.scale.linear()
      .domain([minYear-0.5,maxYear+0.5])
      .range([0,contWidth]);

  var yScale = d3.scale.linear()
      .domain([0.5,12.5])
      .range([0,contHeight]);

  var yScaleTxt = d3.scale.ordinal()
      .domain(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"])
      .rangeBands([0,contHeight]);

  var colorScale = d3.scale.linear()
      .domain([minTempDiff,0,maxTempDiff])
      .range(["#2c7bb6", "#ffffbf", "#d7191c"])
      .interpolate(d3.interpolateHcl);

  //// This sets the x and y axes for the plot ////

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .tickPadding(10)
      .tickFormat(d3.format(""))
      .orient("bottom");
    
  var yAxis = d3.svg.axis()
      .scale(yScaleTxt)
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
      .attr("x", chartWidth/2)
      .attr("y", contHeight + margin.top + 50)
      .text("Year");

  chart.append("text")
      .attr("class", "axisLabel")
      .attr("x", -(contHeight/2)-margin.top)
      .attr("y", 30)
      .attr("transform", "rotate(-90)")
      .text("Month");

  //// This adds a group for each item in the data array, appending one if it doesn't exist, and it positions the group in space based on the year and month of the data point. This also binds a function to each element that modifies the text box ////

  var dataPts = chart.selectAll(".dataPts")
      .data(dataObj.monthlyVariance)
      .enter().append("g")
      .attr("class", "dataPts")
      .attr("transform", function(d) { 
        var xPos = xScale(d.year-0.5) + margin.left;
        var yPos = yScale(d.month-0.5) + margin.top;
        return "translate(" + xPos + "," + yPos + ")"; 
      });

  //// This then appends a rectangle element to each data point group in the correct x,y location ////

  dataPts.append("rect")
      .attr("class", "dataRects")
      .attr("height", function() {
        return yScale(2)-yScale(1);
      })
      .attr("width", function() {
        return xScale(2)-xScale(1);
      })
      .attr("fill", function(d) {
        return colorScale(d.variance);
      });

  //// This adds a single text element to the chart that gets modified when each data point is moused over ////

  chart.append("text")
      .attr("id","info")
      .attr("x",0)
      .attr("y",0);

  //// This adds the color bar ////

  var colorVals = [];
  function setColorBar() {
    for (var n = minTempDiff; n < maxTempDiff; n++) {
      colorVals.push(n);
    }
  }
  setColorBar();

  var cbX = 520;
  var cbY = 320;
  var cbHeight = 15;
  var cbWidth = 20;

  chart.append("g")
      .attr("class", "colorBar")
      .attr("transform", function(d) { 
        return "translate(" + cbX + "," + cbY + ")"; 
      });

  var colorBar = chart.select(".colorBar");
  colorBar.selectAll(".colors")
      .data(colorVals)
      .enter().append("rect")
      .attr("class", "colors")
      .attr("height", cbHeight)
      .attr("width", cbWidth)
      .attr("transform", function(d,i) {
        return "translate(" + (i*cbWidth) + "," + 0 + ")";
      })
      .attr("fill", function(d) {
        return colorScale(d);  
      });

  var cbScale = d3.scale.ordinal()
      .domain(colorVals)
      .rangeBands([0,(cbWidth*colorVals.length)]);

  var cbAxis = d3.svg.axis()
      .scale(cbScale)
      .tickPadding(10)
      .orient("bottom");

  colorBar.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + 0 + "," + cbHeight + ")")
      .call(cbAxis);

  colorBar.append("text")
      .attr("class", "cbLabel")
      .attr("x", 45)
      .attr("y", 60)
      .text("Global Temp Deviation C");
                 
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
  
  //// This is the mouseover event that acts as a tooltip ////

  var mouseOn = function(event) {
    var group = event.target.parentNode;
    var groupClass = group.getAttribute("class");
    var info = document.getElementById("info");
    if (groupClass == "dataPts") {
      var data = group.__data__;
      var xPos = xScale(data.year-0.5) + margin.left;
      if (xPos > 600) {xPos = 600;}
      var yPos = yScale(data.month-0.5) + margin.top;
      info.textContent = monthConvert(data.month) + " " + data.year + " (" + data.variance + " C)";
      info.setAttribute("x",xPos);
      info.setAttribute("y",yPos-7);
    } else {
      info.innerHTML = "";
    }
  }

  //// This binds the mouse event to the chart, and it captures the events via bubbling ////

  var chart = document.getElementsByClassName('chart');
  chart[0].onmouseover = mouseOn;
}