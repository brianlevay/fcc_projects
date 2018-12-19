/* This gets the list of bars from Yelp, and then it kicks off a request for user info */

function getBars(location) {
	location = location.replace(/[<>]/g,'');
  $.ajax({
    url: document.location.origin + "/nightlife/search/?place=" + encodeURIComponent(location),
    type: 'GET',
    dataType: 'json',
    success: function(results) {
    	$('#locationShow').text(location);
      $('#prevSearch').val(location);
      var output = addYelp(results);
      $('#barSect').html(output.newHTML);
      getUsers(output.barList);
    },
    error: function() {
      $('#barSect').html("Error running Yelp search. Please try again");
    }
  });
}

/* This generates the new html from the Yelp results */

function addYelp(results) {
	var newHTML = "";
  var barList = [];
  
  for (var i=0, len=results.length; i < len; i++) {
    barList.push(results[i].id);
    newHTML += 
    	'<div class="barPreview">' +
	    	'<div class="thumbnailDiv">' + 
	    		'<img class="thumbnail" src="' + results[i].image_url + '" alt="' + results[i].name + ' thumbnail">' + 
	    	'</div>' + 
	    	'<div class="barDetails">' + 
		    	'<div class="barName">' + 
		    		'<a class="nameLink" href="' + results[i].url + '" target="_blank">' + results[i].name + '</a>' + 
		    	'</div>' + 
		    	'<div class="ratingDiv">' + 
		    		'<img class="rating" src="' + results[i].rating_img_url_small + '">' + 
		    		'<span class="reviewCt">' + results[i].review_count + ' reviews' + '</span>' + 
		    	'</div>' + 
		    '</div>' + 
	    	'<div class="snippetDiv">' + 
	    		'<span class="snippet">' + results[i].snippet_text + '</span>' + 
	    		'<a class="moreLink" href="' + results[i].url + '" target="_blank">More</a>' + 
	    	'</div>' + 
	    	'<div class="bar_id">' + results[i].id + '</div>' + 
	    '</div>';
  }
  return {newHTML: newHTML, barList: barList};
}

/* This gets the users going to the bars on the page */

function getUsers(barList) {
  $.ajax({
    url: document.location.origin + "/nightlife/whoisgoing",
    type: 'POST',
  	data: {barList: barList}, 
    dataType: 'json',
    success: function(results) {
      addGoing(results);
    }
  });
}

/* This takes the initial results of who is going and sorts them into days based on local times */

function processResults(results) {
	/* results = { username: username, auth: true, list: [{ id: bar_id, going: [["user","date"], ...] }, ...] } */
	/* sorted = { username: username, auth: true, list: [{ id: bar_id, going: [["today"],["tomorrow"],["next"]] }, ...] } */
	var now = new Date();
	var utcToday = new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()+0,23,59));
	var utcTomorrow = new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()+1,23,59));
	var utcNext = new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()+2,23,59));
	
	var sorted = results;
	for (var i=0,lenI=sorted.list.length; i<lenI; i++) {
		var goingOld = sorted.list[i].going;
		var goingNew = [[],[],[]];
		for (var j=0,lenJ=goingOld.length; j<lenJ; j++) {
			var dbdate = new Date(goingOld[j][1]);
			if (dbdate >= utcToday && dbdate < utcTomorrow) {
				goingNew[0].push(goingOld[j][0]);
			} else if (dbdate >= utcTomorrow && dbdate < utcNext) {
				goingNew[1].push(goingOld[j][0]);
			} else if (dbdate >= utcNext) {
				goingNew[2].push(goingOld[j][0]);
			}
		}
		sorted.list[i].going = goingNew;
		if (i===0) {console.log(JSON.stringify(goingNew));}
	}
	return sorted; 
}

/* This creates the html for who is going on each day */

function addGoing(results) {
	var sorted = processResults(results);
	/* sorted = { username: username, auth: true, list: [{ id: bar_id, going: [["today"],["tomorrow"],["next"]] }, ...] } */
  
  $('.barPreview').each(function(n,val){
  	var todayCt = sorted.list[n].going[0].length;
  	var tomorrowCt = sorted.list[n].going[1].length;
  	var nextCt = sorted.list[n].going[2].length;
  	
  	var joinToday = '';
  	var joinTomorrow = '';
  	var joinNext = '';
  	
  	var listToday = '';
  	var listTomorrow = '';
  	var listNext = '';
  	
  	if (results.auth === true) {
  		joinToday = '<div class="not-going respond">NOT</div>';
  		joinTomorrow = '<div class="not-going respond">NOT</div>';
  		joinNext = '<div class="not-going respond">NOT</div>';
  		
  		listToday = '<div class="listSect">';
  		listTomorrow = '<div class="listSect">';
  		listNext = '<div class="listSect">';
  		
  		for (var i=0; i < todayCt; i++) {
  			if (sorted.list[n].going[0][i] == sorted.username) {
  				joinToday = '<div class="going respond">GOING</div>';
  			}
  			listToday += '<span class="person">' + sorted.list[n].going[0][i] + '</span>';
  		}
  		for (var i=0; i < tomorrowCt; i++) {
  			if (sorted.list[n].going[1][i] == sorted.username) {
  				joinTomorrow = '<div class="going respond">GOING</div>';
  			}
  			listTomorrow += '<span class="person">' + sorted.list[n].going[1][i] + '</span>';
  		}
  		for (var i=0; i < nextCt; i++) {
  			if (sorted.list[n].going[2][i] == sorted.username) {
  				joinNext = '<div class="going respond">GOING</div>';
  			}
  			listNext += '<span class="person">' + sorted.list[n].going[2][i] + '</span>';
  		}
  		listToday += '</div>';
  		listTomorrow += '</div>';
  		listNext += '</div>';
  	}
  	
    $(this).append(
    	'<div class="going">' + 
    		'<div class="goingTitle">Going?</div>' + 
	    	'<div class="today">' + 
	      	'Today: ' + 
	      	'<div class="tally">' + todayCt + '</div>' + 
	      	joinToday + 
	      	listToday + 
	      '</div>' + 
	      '<div class="tomorrow">' + 
	      	'Tomorrow: ' + 
	      	'<div class="tally">' + tomorrowCt + '</div>' + 
	      	joinTomorrow + 
	      	listTomorrow + 
	      '</div>' + 
	      '<div class="next">' + 
	      	'Day After: ' + 
	      	'<div class="tally">' + nextCt + '</div>' + 
	      	joinNext + 
	      	listNext + 
	      '</div>' + 
			'</div>'
    );
  });
  if (results.auth === true) {
	  $('#barSect').append('<div id="showList"></div>');
	  $('#showList').hide();
	  addListOpen();
	  addAttendAJAX();
  }
}

/* This adds the ability to see the lists of attendees */

function addListOpen() {
  $('.today, .tomorrow, .next').click(function(){
  	var contents = $(this).find('.listSect').html()
  	var position = $(this).offset();
  	$('#showList').show();
  	$('#showList').offset({ top: position.top - 60, left: position.left });
  	$('#showList').html(contents);
  	$('#showList').attr('display','block');
  });
  $('#showList').click(function(){
  	$(this).hide();
  });
}

/* This binds update events to the newly added "who's going" elements */

function addAttendAJAX() {
	$('.respond').click(function(){
		var user = $('.barSectHeader').text().replace('Welcome, ','').replace('!','');
    var bar = $(this).parents('.barPreview').children('.bar_id').text();
    var day = $(this).parent().attr('class');
    var count = $(this).prev().text();
    var response = "";
		if ($(this).attr('class') == 'not-going respond') {
			response = 'GOING';
			$(this).attr('class','going respond');
			$(this).prev().text(parseInt(count)+1);
			$(this).text(response);
			$(this).next().append('<span class="person">' + user + '</span>');
		} else {
			response = 'NOT';
			$(this).attr('class','not-going respond');
			$(this).prev().text(parseInt(count)-1);
			$(this).text(response);
			$(this).next().find('.person:contains('+ user + ')').remove();
		}
		updateAttend(response,bar,day);
  });
}

/* This sends the add and remove requests for bar attendance */

function updateAttend(response, bar, day) {
	var dayshift = 0;
	if (day == "today") {dayshift = 0;}
	else if (day == "tomorrow") {dayshift = 1;}
	else {dayshift = 2;}
	
	var now = new Date();
	var date = new Date(now.getFullYear(),now.getMonth(),now.getDate()+dayshift,23,59).toUTCString();
	
  $.ajax({
    url: document.location.origin + "/nightlife/update",
    type: 'POST',
  	data: {response: response, bar: bar, date: date}, 
    dataType: 'text',
    success: function(results) {
      /* Nothing */
    }
  });
}

/* This automatically runs the query for the previous search on page load */

$(document).ready(function(){
  var prevSearch = $("#prevSearch").val();
  if (prevSearch != "") {
      getBars(prevSearch);
  }
});

/* This binds the main search query to the button */

$("#searchBtn").click(function(){
  var location = $("#searchLoc").val();
  if (location != "") {
      getBars(location);
  } else {
      alert("Please enter a location");
  }
});

