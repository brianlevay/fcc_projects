/******************************************************************/
/* BOOK TRADING APP ROUTES */
/******************************************************************/

function setBookRoutes(app,pool,https,users,b_tables,b_utils) {
	  
	app.get('/books',
	  function(req, res){
      req.session.backURL = '/books';
      res.render('./books/b_home', { user: req.user });
    });
	
	app.get('/books/top/',
	  function(req, res){
	  	var start = req.query.offset;
	  	var num = req.query.num;
	  	b_tables.getAllCopiesForTrade(pool,start,num,function(err,results){
	  		if (err) {
	  			res.send({error: err});
	  		} else {
	  			var data = {topCopies: results};
	  			res.send(data);
	  		}
	  	});
    });
  
  app.get('/books/user/data',
	  function(req, res){
	  	if (req.isAuthenticated()) {
	  		b_tables.getUserCopies(pool,req.user,function(err,results){
	  			if (err) {
	  				res.send({error: "Could not get user data. Please try again"});
	  			} else {
	  				var data = {user: req.user, myCopies: results.myCopies, myRequests: results.myRequests};
      			res.send(data);
	  			}
	  		});
	  	} else {
      	res.send({message: "You don't have permission to access this resource"});
	  	}
    });
  
  app.post('/books/user/update',
	  function(req, res){
	  	if (req.isAuthenticated()) {
	  		users.updateUser(req.body.user,pool,function(err,success){
	  			if (err) {
	  				res.send({error: err});
	  			} else {
	  				res.send({success: success});
	  			}
	  		});
	  	} else {
	  		res.send({message: "You don't have permission to access this resource"});
	  	}
    });
    
	app.get('/books/user/new/',
	  function(req, res){
	  	if (req.isAuthenticated()) {
		  	if (req.query.text) {
		  		b_utils.searchForBookTitle(https, req.query.text, function(err,suggestedBooks){
		  			if (err) {
		  				res.send({error: err});
		  			} else {
		  				var data = {suggestedBooks: suggestedBooks};
		  				res.send(data);
		  			}
		  		});
		  	} else if (req.query.isbn13) {
		  		b_utils.searchForBookISBN13(https, req.query.isbn13, function(err,suggestedBooks){
		  			if (err) {
		  				res.send({error: err});
		  			} else {
		  				var data = {suggestedBooks: suggestedBooks};
		  				res.send(data);
		  			}
		  		});
		  	} else {
		  		res.send({error: "No search information provided"});
		  	}
	  	} else {
	  		res.send({message: "You don't have permission to access this resource"});
	  	}
    });
  
  app.post('/books/user/add/',
	  function(req, res){
	  	if (req.isAuthenticated()) { 
		  	b_tables.createNewCopy(pool,req.body.book,req.user,function(err,result){
		  		if (err) {
		  			res.send({error: err});
		  		} else {
		  			var copy = req.body.book;
		  			copy.copy_id = result;
		  			copy.requested_by = "none";
		  			for (var key in req.user) {
		  				if (req.user.hasOwnProperty(key)) {
		  					copy[key] = req.user[key];
		  				}
		  			}
		  			var data = {copy: copy};
		  			res.send(data);
		  		}  
		  	});
	  	} else {
	  		res.send({message: "You don't have permission to access this resource"});
	  	}
    });
    
  app.post('/books/user/remove/',
	  function(req, res){
	  	if (req.isAuthenticated()) { 
		  	b_tables.removeCopy(pool,req.body.copy_id,req.user,function(err,result){
		  		if (err) {
		  			res.send({error: err});
		  		} else {
		  			res.send({success: "Success!"});
		  		}  
		  	});
	  	} else {
	  		res.send({message: "You don't have permission to access this resource"});
	  	}
	  });
	
	app.post('/books/request/',
	  function(req, res){
	  	if (req.isAuthenticated()) { 
				b_tables.toggleRequest(pool, req.body.copy_id, req.body.username, req.body.cancel, function(err,result) {
					if (err) {
						res.send({error: err});
					} else {
						res.send({success: "Book request modified"});
					}
				});
	  	} else {
	  		res.send({message: "You don't have permission to access this resource"});
	  	}
    });
    
  app.get('/books/options/',
	  function(req, res){
	  	if (req.isAuthenticated()) {
				if (req.query.username) {
					b_tables.viewTradeOpts(pool, req.query.username, function(err,results){
						if (err) {
							res.send({error: err});
						} else {
							res.send({tradeOptions: results});
						}
					});
				} else {
					res.send({error: "No username supplied"});
				}
	  	} else {
	  		res.send({message: "You don't have permission to access this resource"});
	  	}
    });
    
  app.post('/books/trade/',
	  function(req, res){
	  	if (req.isAuthenticated()) {
	  		b_tables.tradeCopies(pool, req.body.myTrade, req.body.otherTrade, function(err,result){
	  			if (err) {
	  				res.send({error: err});
	  			} else {
	  				res.send({success: "The books were traded!"});
	  			}
	  		});
	  	} else {
	  		res.send({message: "You don't have permission to access this resource"});
	  	}
    });
}

/* This makes the method available */

module.exports = {
    setBookRoutes: setBookRoutes
};

