/* This section sets up the ajax call to the server. 
This allows the visitor the ability to test the API endpoint 
without having to pass the query into the browser url */

function submitQuery() {
    var message = document.getElementById('message');
    var shortLink = document.getElementById('shortLink');
    var urlBase = document.location.origin + "/url/api/new";
    var queryRaw = document.getElementById('queryText').value.replace(/[<>]/g,"");
    var queryURL = urlBase + "?url=" + encodeURIComponent(queryRaw);
    
    $.ajax({
       url: queryURL,
       type: 'GET',
       success: function(data) {
            if (data.search('http') === 0) {
                shortLink.innerHTML = data;
                shortLink.href = data;
                message.innerHTML = "<br>Here's your link.";
            } else {
                shortLink.innerHTML = "";
                shortLink.href = "";
                message.innerHTML = data;
            }
       },
       error: function(xhr,status,error) {
           message.innerHTML += "<br>" + error.message;
       }
    });
}

/* This just binds the ajax call to the button on the page */

var button = document.getElementById("submitQuery");
button.onclick = submitQuery;

/* End of script */