//// This section gets the data ////

var dataObj;
var dataURL = "https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json";

d3.json(dataURL, function(error,json){
  dataObj = json;
  buildGraph();
});

//// This is the function that is called within the JSON request ////

function buildGraph() {
  
  //// This sets up the SVG chart dimensions ////

  var chartWidth = 600;
  var chartHeight = 600;

  //// This selects the SVG with D3 and sets its size using a viewBox rather than absolute height and width. This allows the SVG to resize on the page, and everything within the SVG will adjust accordingly. ////

  var chart = d3.select(".chart")
      .attr("viewBox", "0 0 " + chartWidth + " " + chartHeight);
    
  //// This creates the force layout ////

  var force = d3.layout.force()
      .nodes(dataObj.nodes)
      .links(dataObj.links)
      .size([chartWidth, chartHeight])
      .charge(-50)
      .linkDistance(40);

  //// This creates the nodes and links for visualization ////

  var links = chart.selectAll(".connections")
      .data(dataObj.links)
      .enter().append("line")
      .attr("class","connections");

  var nodes = chart.selectAll(".countries")
      .data(dataObj.nodes)
      .enter().append("g")
      .attr("class", "countries")
      .call(force.drag)
      .on("mouseover",function(d){
        var tooltip = document.getElementById("tooltip");
        var textbox = document.getElementById("textbox");
        var xpos = d.x + 5;
        var ypos = d.y + 10;
        var contents = d.country;
        tooltip.setAttribute("x",xpos);
        tooltip.setAttribute("y",ypos);
        textbox.innerHTML = contents;
      })
      .on("mouseout",function(d){
        var tooltip = document.getElementById("tooltip");
        var textbox = document.getElementById("textbox");
        tooltip.setAttribute("x",-10);
        tooltip.setAttribute("y",-10);
        textbox.innerHTML = "";
      });
 
  //// This adds the images to the nodes ////

  nodes.append("foreignObject")
      .attr("class","flagObj")
      .attr("width",17)
      .attr("height",12)  
      .attr("x",-8)
      .attr("y",-5.5)
      .append("xhtml:div")
      .attr("class", function(d) {
        return "flag flag-" + d.code;
      });

  //// This adds a single object to be used as the tooltip. It has to be added to the chart and not the nodes to be sure that it's always in front of all nodes! ////

  chart.append("foreignObject")
      .attr("id","tooltip")
      .attr("width",80)
      .attr("height",100)  
      .attr("x",-10)
      .attr("y",-10)
      .append("xhtml:div")
      .attr("id","textbox")
      .html("");

  //// This sets the behavior of the force display, allowing you to see the movements ////

  force.on('tick', function() {
    nodes.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  
    links.attr("x1", function(d) {return d.source.x;})
        .attr("y1", function(d) {return d.source.y;})
        .attr("x2", function(d) {return d.target.x;})
        .attr("y2", function(d) {return d.target.y;});
  });

  //// This starts the animation ////

  force.start();
}