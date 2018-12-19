/******************************************************************/
/* SOCKET BEHAVIOR */
/******************************************************************/

var socket = io.connect();
var dataObj = {};

$('#sendNew').on("click", function(){
	var stock = $('#stockNew').val().toUpperCase();
  socket.emit('requestAdd', stock);
  $('#stockNew').val('');
  $('#warning').text('');
});

$('.stockList').on('click', '.delete', function(){
	socket.emit('requestDelete', $(this).prev().text());
	$(this).parent().remove();
});

socket.on('initialStocks', function(initialObj){
	dataObj = initialObj;
	buildChart(dataObj,true);
	for (var key in dataObj) {
		addStockDiv(key);
	}
});

socket.on('addStock', function(newObj){
	for (var key in newObj) {
		dataObj[key] = newObj[key];
		addStockDiv(key);
	}
	buildChart(dataObj,false);
});

socket.on('noStock', function(msg){
	$('#warning').text(msg);	
});

socket.on('deleteStock', function(stock){
	delete dataObj[stock];
	buildChart(dataObj,false);
	$('.stock:contains(' + stock + ')').remove();
});

/******************************************************************/
/* DOM UTILITY FUNCTIONS */
/******************************************************************/

function addStockDiv(stock){
	$('.stockList').append(
		'<div class="stock">' + 
			'<div class="stockName">' + stock + '</div>' + 
			'<div class="delete">REMOVE</div>' + 
		'</div>'
	);
}

/******************************************************************/
/* D3 CHART BUILDING */
/******************************************************************/

function buildChart(dataObj,newChart) {
	
	//// Note that viewBox is set in the html file to improve page loading. Make sure these numbers stay synced! ////
	
	var chartWidth = 600;
	var chartHeight = 300;
	var margin = {top: 10, right: 10, bottom: 50, left: 50};
	var contWidth = chartWidth - margin.left - margin.right;
	var contHeight = chartHeight - margin.top - margin.bottom;
	
	//// This prepares the data for the plot ////
	
	var minTime = new Date();
	var maxTime = new Date();
	var minPrice = 0;
	var maxPrice = 0;
	
	for (var key in dataObj) {
		var stock = key;
		var prices = dataObj[stock].prices;
		prices.forEach(function(d){
			d[0] = new Date(d[0]);
			d[1] = +d[1];
			if (d[0] < minTime) {minTime = d[0];}
			if (d[1] > maxPrice) {maxPrice = d[1];}
		});
	}
	
	//// This sets the x and y scales for the plot ////
	
	var xScale = d3.time.scale()
		.range([0,contWidth])
		.domain([minTime, maxTime]);
			
	var yScale = d3.scale.linear()
		.range([contHeight,0])
		.domain([minPrice, maxPrice]);
	
	var xAxis = d3.svg.axis()
	  .scale(xScale)
	  .tickPadding(10)
	  .orient("bottom");
	    
	var yAxis = d3.svg.axis()
		.scale(yScale)
	  .tickPadding(10)
	  .orient("left");
	
	var chartLine = d3.svg.line()
		.x(function(d) { return xScale(d[0])+margin.left; })
		.y(function(d) { return yScale(d[1])+margin.top; });
	
	//// This selects the SVG with D3 and sets its size using a viewBox rather than absolute height and width. This allows the SVG to resize on the page, and everything within the SVG will adjust accordingly. This then adds axes and axis labels ////
	
	var chart = d3.select(".chart");
	
	if (newChart === true) {
		
		chart.append("g")
		  .attr("class", "xAxis")
		  .attr("transform", "translate(" + margin.left + "," + (contHeight + margin.top) + ")");
		
		chart.append("g")
			.attr("class", "yAxis")
		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		chart.append("text")
			.attr("class", "axisLabel")
		  .attr("x", (contWidth/2) + margin.left - 20) // last number is correction for label width //
		  .attr("y", chartHeight - 10)
		  .text("Date");
		
		chart.append("text")
			.attr("class", "axisLabel")
		  .attr("x", -(contHeight/2) - margin.top - (contHeight/4)) // last number is correction for label height //
		  .attr("y", 15)
		  .attr("transform", "rotate(-90)")
		  .text("Closing Price ($)");
		  
	}
	
	chart.select(".xAxis").call(xAxis);
	chart.select(".yAxis").call(yAxis);
	
	$('.chartLine').remove();
	$('.dataSymbs').remove();
	$('.dataPts').remove();
	
	var colors = ["black","purple","steelblue","darkgreen","yellow","orange","red"];
	var count = 0;
	
	for (var key in dataObj) {
		stock = key;
		prices = dataObj[stock].prices;
		var n = count % colors.length;
		var color = colors[n];
		count++;
		
		chart.append("path")
			.attr("class","chartLine " + stock)
			.attr("stroke",color)
			.attr("d", chartLine(prices));
			
		var dataPts = chart.selectAll("div")
    	.data(prices)
    	.enter().append("g")
    	.attr("class", "dataPts " + stock)
    	.attr("transform", function(d) { 
      	var xPos = xScale(d[0]) + margin.left;
      	var yPos = yScale(d[1]) + margin.top;
      	return "translate(" + xPos + "," + yPos + ")"; 
    	});

		dataPts.append("circle")
    	.attr("class", "dataSymbs " + stock)
    	.attr("stroke",color)
    	.attr("fill",color)
    	.attr("r",5)
    	.style("opacity",0);
	}
	
	$('.dataPts').on("click",function(e){
		showStockData(e);
	});
	
}

/******************************************************************/
/* D3 TOOLTIP CONSTRUCTION */
/******************************************************************/

function showStockData(e) {
	var tooltip = document.getElementById("tool");
	var clicked = e.target;
	var type = clicked.getAttribute("class").split(" ");
	var stock = type[1];
	var data = clicked.__data__;
	var date = new Date(data[0]);
	var datePrint = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
	
	tooltip.innerHTML = stock + ": " + datePrint + ", " + data[1];
	clicked.style.opacity = 1;
	$(".dataSymbs").not(clicked).css("opacity",0);
}

