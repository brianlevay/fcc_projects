/******************************************************************/
/* STOCK CHART APP ROUTES */
/******************************************************************/

function setStockRoutes(app, cache, io, https, s_utils) {
	  
	app.get('/stocks',
	  function(req, res){
	    req.session.backURL = '/stocks';
      res.render('./stocks/s_home', { user: req.user });
	  });
	
	var stockSet = ['FB','GOOG','AAPL'];
	
	io.on('connection', function(socket){
		
		s_utils.sendInitialData(cache, https, stockSet, socket);
		
		socket.on('requestAdd', function(stock){
			s_utils.getDataFromAPI(cache, https, stock, function(err,success){
				if (err) {
					console.log(err);
					socket.emit('noStock', stock + " could not be found"); 
				} else { 
					stockSet.push(stock);
					io.sockets.emit('addStock',{[stock]: cache.stocks[stock]}); 
				}
			});
		});
		
		socket.on('requestDelete', function(stock){
			var index = stockSet.indexOf(stock);
			if (index > -1) {
				stockSet.splice(index,1);
				delete cache.stocks[stock];
			}
			io.sockets.emit('deleteStock', stock);
		});
		
		socket.on('disconnect', function(){
			console.log('client disconnected');
		});
	});
}

/* This makes the method available */

module.exports = {
    setStockRoutes: setStockRoutes
};

