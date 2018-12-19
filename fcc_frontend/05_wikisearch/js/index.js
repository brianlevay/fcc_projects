//// This is the main API function.  I had to resort to using a JSONP request, so I couldn't pass custom headers as requested by the MediaWiki API documentation. ////

function getSearchResults(searchString, rand) {
  var results = document.getElementById("results");
  var searchStringFormatted = searchString.replace(" ","+");
  var searchURL = "https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&titles=Main+Page&srsearch=" + searchStringFormatted;
  var randomURL = "https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1";
  var apiURL = "";
  if (rand === false) {apiURL = searchURL;} else {apiURL = randomURL;}
  var linkStr = "";
  var linkFull = "";
  
  $.ajax( {
      url: apiURL,
      type: 'GET',
      dataType: 'jsonp',
      success: function(data) {
        if (rand === false) {
          var resultNum = data.query.search.length;
          results.innerHTML += '<p id="search-header">Search Results for: "' + searchString + '"</p>';
          for (var i = 0; i < resultNum; i++) {
            linkStr = data.query.search[i].title;
            linkStr = linkStr.replace(" ","_");
            linkFull = "https://en.wikipedia.org/wiki/" + linkStr;
            results.innerHTML += '<div class="entry"><a href='+linkFull+' target="_blank"><p class="title-link">' + data.query.search[i].title + '</p><p class="description">'+data.query.search[i].snippet+'</p></a></div>';
          }
        } else {
          results.innerHTML += '<p id="search-header">Random Result</p>';
          linkStr = data.query.random[0].title;
          linkStr = linkStr.replace(" ","_");
          linkFull = "https://en.wikipedia.org/wiki/" + linkStr;
          results.innerHTML += '<div class="entry"><a class="title-link" href='+linkFull+' target="_blank">' + data.query.random[0].title + '</a></div>';
        }
      }
  } );
}

//// These bind the .ajax query to the buttons ////

$("#search-btn").click(function(){
  var results = document.getElementById("results");
  results.innerHTML = "";
  var searchBar = document.getElementById("search-bar");
  var searchString = searchBar.value;
  getSearchResults(searchString, false);
});

$("#random-btn").click(function(){
  var results = document.getElementById("results");
  results.innerHTML = "";
  getSearchResults("none", true);
});