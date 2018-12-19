/* This section sets up the ajax call to the server. 
This allows the visitor the ability to test the API endpoint 
without having to pass the query into the browser url */

function submitQuery() {
    var outputSect = document.getElementById('outputSect');
    var urlBase = document.location.origin + "/search/api/";
    var queryRaw = document.getElementById('queryText').value.replace(/[<>]/g," ");
    var pageNum = document.getElementById('pageNum').value;
    if (isNaN(pageNum)) {pageNum = "0";}
    var queryURL = urlBase + "new?text=" + encodeURIComponent(queryRaw) + 
        "&offset=" + encodeURIComponent(pageNum);
    
    $.ajax({
       url: queryURL,
       type: 'GET',
       success: function(data) {
           var jsonStr = JSON.stringify(data);
           var printable = jsonStr.replace(/","/g,",<br>").replace(/},{/g,"},<br><br>{");
           outputSect.innerHTML = printable;
       },
       error: function(xhr,status,error) {
           outputSect.innerHTML = error.message;
       }
    });
}

/* This gets the recent searches */

function getRecent() {
    var outputSect = document.getElementById('outputSect');
    var urlBase = document.location.origin + "/search/api/";
    var queryURL = urlBase + "recent/";
    
    $.ajax({
       url: queryURL,
       type: 'GET',
       success: function(data) {
           var json = JSON.stringify(data);
           var printable = json.replace(/\\/g,"").replace(/},{/g,"},<br>{");
           outputSect.innerHTML = printable;
       },
       error: function(xhr,status,error) {
           outputSect.innerHTML = error.message;
       }
    });
}

/* This just binds the ajax calls to the buttons on the page */

var search = document.getElementById("submitQuery");
var recent = document.getElementById("getRecent");
search.onclick = submitQuery;
recent.onclick = getRecent;

/* End of script */