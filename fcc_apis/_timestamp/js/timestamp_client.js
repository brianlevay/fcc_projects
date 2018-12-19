/* This section sets up the ajax call to the server. 
This allows the visitor the ability to test the API endpoint 
without having to pass the query into the browser url */

function submitQuery() {
    var outputSect = document.getElementById('outputSect');
    var urlBase = document.location.origin + "/time/api/";
    var queryRaw = document.getElementById('queryText').value.replace(/[<>]/g," ");
    var queryURL = urlBase + "?date=" + encodeURIComponent(queryRaw);
    
    $.ajax({
       url: queryURL,
       type: 'GET',
       success: function(data) {
           outputSect.innerHTML = JSON.stringify(data);
       },
       error: function(xhr,status,error) {
           outputSect.innerHTML = error.message;
       }
    });
}

/* This just binds the ajax call to the button on the page */

var button = document.getElementById("submitQuery");
button.onclick = submitQuery;

/* End of script */