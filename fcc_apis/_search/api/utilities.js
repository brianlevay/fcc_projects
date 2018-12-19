/* Import modules */

var https = require('https');
var db = require('./db_search.js');

/* This makes the API call to Flickr */

function getDataFromAPI(searchString,pageNum,res,pool,mem) {
  var serverConfig = {
    host: 'api.flickr.com',
    path: '/services/rest/?method=flickr.photos.search&api_key=' + process.env.API_KEY + 
    '&tags=' + searchString + '&text=' + searchString + 
    '&format=json&nojsoncallback=1',
    method: 'GET'
  };
  var results = "response: ";
  https.request(serverConfig, function(call) {
    call.on('data', function(data) {
      results += data;
    });
    call.on('error', function(err) {
      console.log(err);
    });
    call.on('end', function() {
      var pages = processFlickrResults(results,20);
      mem.set(searchString,pages);
      db.addSearch(searchString,pool);
      if (pageNum > pages.length) {pageNum = pages.length;}
      res.send(pages[pageNum-1]);
    });
  }).end();
}

/* This splits the API results into an array with the desired fields, then
creates a page array of the results for easier navigation */

function processFlickrResults(results,numPerPage) {
    var trimmed = JSON.parse(results.replace("response: ",""));
    var photos = trimmed.photos.photo;
    var total = photos.length;
    
    var data = [];
    for (var i = 0; i < total; i++) {
        var title = photos[i].title;
        var photoURL = "https://farm" + photos[i].farm + ".staticflickr.com/" + 
            photos[i].server + "/" + photos[i].id + "_" + photos[i].secret + ".jpg";
        var pageURL = "https://www.flickr.com/photos/" + photos[i].owner + "/" + photos[i].id;
        var entry = {num: i+1, title: title, photoURL: photoURL, pageURL: pageURL};
        data.push(entry);
    }
    
    var pages = [];
    var numPages = Math.ceil(total/numPerPage);
    for (var p = 0; p < numPages; p++) {
        var start = p*numPerPage;
        var end = (p+1)*numPerPage;
        if (end > total+1) {end = total+1;}
        var page = data.slice(start,end);
        pages.push(page);
    }
    
    return pages;
}

/* Forms of Flickr URLs:
    https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg 
    https://www.flickr.com/photos/{user-id}/{photo-id} - individual photo
*/

/* This makes the function available */

module.exports = {
    getDataFromAPI: getDataFromAPI
};



