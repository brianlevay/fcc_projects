/* This makes the API call to Quandl */

function getDataFromAPI(cache, https, stock, callback) {
	var now = new Date();
	var today = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
  var lastyr = (now.getFullYear()-1) + '-' + (now.getMonth()+1) + '-' + now.getDate();
  var serverConfig = {
    host: 'www.quandl.com',
    path: '/api/v3/datasets/WIKI/' + stock + '/data.json?start_date=' + lastyr + '&column_index=4&api_key=' + process.env.QNDL_KEY,
    method: 'GET'
  };
  var temp = '';
  https.request(serverConfig, function(call) {
    call.on('data', function(data) {
      temp += data;
    });
    call.on('error', function(err) {
      return callback(err,null);
    });
    call.on('end', function() {
    	var json = JSON.parse(temp);
    	if (json.quandl_error) {
    		return callback("Stock could not be found",null);
    	} else {
    		cache.stocks[stock] = {};
      	cache.stocks[stock].date = today;
      	cache.stocks[stock].prices = json.dataset_data.data;
      	return callback(null,"success");
    	}
    });
  }).end();
}

/* This gets all of the results in stockSet, either from the cache or new API calls, and then sends them on a new connection */

function sendInitialData(cache, https, stockSet, socket) {
	var now = new Date();
	var today = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
	var ready = 0;
  
	for (var i=0; i < stockSet.length; i++) {
		var stock = stockSet[i];
		if (!cache.stocks[stock] || cache.stocks[stock].date < today) {
			getDataFromAPI(cache, https, stock, function(err,success){
				if (err) {console.log(err);}
				ready++;
				if (ready == stockSet.length) {socket.emit('initialStocks',cache.stocks);}
			});
		} else {
			ready++;
			if (ready == stockSet.length) {socket.emit('initialStocks',cache.stocks);}
		}
	}
}

/* This makes the method available */

module.exports = {
    getDataFromAPI: getDataFromAPI,
    sendInitialData: sendInitialData
};
