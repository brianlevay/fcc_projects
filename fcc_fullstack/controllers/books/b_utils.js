/* This searches the Google Books API based on a title */

function searchForBookTitle(https, title, callback) {
	var formatted = encodeURIComponent(title).replace(/%20/g,"+");
	var serverConfig = {
    host: 'www.googleapis.com',
    path: '/books/v1/volumes?q=' + formatted + '&key=' + process.env.GOOG_KEY + '&country=us',
    method: 'GET'
  };
  var results = '';
  https.request(serverConfig, function(call) {
    call.on('data', function(data) {
      results += data;
    });
    call.on('error', function(err) {
      return callback(err,null);
    });
    call.on('end', function() {
    	var suggestions = processAPIresults(results);
    	return callback(null,suggestions);
    });
  }).end();
}

/* This searches the Google Books API based on an ISBN13 number */

function searchForBookISBN13(https, isbn13, callback) {
	var formatted = encodeURIComponent(isbn13).replace(/[^0-9]/g,"");
	var serverConfig = {
    host: 'www.googleapis.com',
    path: '/books/v1/volumes?q=+isbn:' + formatted + '&key=' + process.env.GOOG_KEY + '&country=us',
    method: 'GET'
  };
  var results = '';
  https.request(serverConfig, function(call) {
    call.on('data', function(data) {
      results += data;
    });
    call.on('error', function(err) {
      return callback(err,null);
    });
    call.on('end', function() {
			var suggestions = processAPIresults(results);
    	return callback(null,suggestions);
    });
  }).end();
}

/* Process API results */

function processAPIresults(results) {
	var answer = JSON.parse(results);
  var books = answer.items;
  var number = books.length;
  var suggestions = [];
  var count = 0;
    	
  for (var i=0; i<number; i++) {
  	var info = books[i].volumeInfo;
  	if (info.title && info.authors && info.imageLinks && info.imageLinks.smallThumbnail && info.infoLink) {
    	var book_id = books[i].id;
	    var isbn13 = "";
	    if (info.industryIdentifiers) {
	    	for (var n=0; n<info.industryIdentifiers.length; n++) {
	    		if (info.industryIdentifiers[n].type == "ISBN_13") {
	    			isbn13 = info.industryIdentifiers[n].identifier;
	    		}
	    	}
	    }
    	var title = info.title;
		  var authors = info.authors.join(", ");
		  var image_url = info.imageLinks.smallThumbnail;
		  var info_url = info.infoLink;
		  var new_image_url = image_url.replace("http","https");
		  var new_info_url = info_url.replace("http","https");
		  var bookInfo = {
		  	book_id: book_id, isbn13: isbn13, title: title, authors: authors, 
		  	image_url: new_image_url, info_url: new_info_url
		  };
		  if (isbn13 != "") {
		  	suggestions.push(bookInfo);
		  	count++;
		  	if (count === 10) {break;}
		  }
    }
  }
  return suggestions;
}

/* This makes the database method available */

module.exports = {
  searchForBookTitle: searchForBookTitle,
  searchForBookISBN13: searchForBookISBN13
};

