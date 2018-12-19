/******************************************************************/
/* PINTREST CLONE APP ROUTES */
/******************************************************************/

function setPinRoutes(app,pool,users,p_tables,p_utils) {
	  
	app.get('/pins',
	  function(req, res){
	  	req.session.backURL = '/pins';
      res.render('./pins/p_home', { user: req.user });
    });
  
  app.get('/pins/api/user/',
	  function(req, res){
	  	if (req.isAuthenticated()) {
	  		res.send({user: req.user});
	  	} else {
	  		res.send({message: "You are not permitted to access this content"});
	  	}
    });
  
  app.get('/pins/api/top/',
	  function(req, res){
	  	p_tables.getTop(pool,req.query.num,function(err,results){
        if (err) {
          res.send({error: err});
      	} else {
      		var walls = p_utils.createWallArray(results);
      		var topWalls = {topCount: req.query.num, walls: walls};
      		res.send({topWalls: topWalls});
      	}
      });
    });
    
	app.get('/pins/api/data/:username',
	  function(req, res){
	  	users.findUser(req.params.username,pool,function(err,user){
    		if (err) {
        	res.send({error: err});
      	} else {
        	p_tables.getCollection(pool,req.params.username,function(err,results){
          	if (err) {
          		res.send({error: err});
      			} else {
      				var walls = p_utils.createWallArray(results);
      				var collection = {username: req.params.username, walls: walls};
      				res.send({collection: collection});
      			}
        	});
      	}
    	});
    });
    
  app.get('/pins/api/data/:username/:wallname',
	  function(req, res){
	  	users.findUser(req.params.username,pool,function(err,user){
    		if (err) {
        	res.send({error: err});
      	} else {
        	p_tables.getWall(pool,req.params.username,req.params.wallname,function(err,results){
          	if (err) {
          		res.send({error: err});
      			} else {
      				var pins = p_utils.filterPins(results, results[0].wall_id);
      				var wall = {wall_id: results[0].wall_id, wallname: req.params.wallname, username: req.params.username, pins: pins};
      				res.send({wall: wall});
      			}
        	});
      	}
    	});
    });
    
  app.get('/pins/api/walls/create/:wallname',
	  function(req, res){
	  	if (req.isAuthenticated()) {
	  		p_tables.createNewWall(pool,req.params.wallname,req.user.username,function(err,result){
					if (err) {
						res.send({error: err});
					} else {
						res.send({wall_id: result});
					}
				});
	  	} else {
	  		res.send({message: "You are not permitted to access this content"});
	  	}
    });
    
  app.get('/pins/api/walls/delete/:wallname',
	  function(req, res){
	  	if (req.isAuthenticated()) {
	  		p_tables.deleteWall(pool,req.params.wallname,req.user.username,function(err,result){
					if (err) {
						res.send({error: err});
					} else {
						res.send({wall_id: result});
					}
				});
	  	} else {
	  		res.send({message: "You are not permitted to access this content"});
	  	}
    });
    
  app.post('/pins/api/pins/add',
	  function(req, res){
	  	if (req.isAuthenticated() && req.body.username === req.user.username) {
	  		p_tables.addPin(pool, req.body.wall_id, req.body.image_url, req.body.comment, function(err,results){
	  			if (err) {
	  				res.send({error: err});
	  			} else {
	  				res.send({pin_id: results});
	  			}
	  		});
	  	} else {
	  		res.send({message: "You are not permitted to access this content"});
	  	}
    });
    
  app.post('/pins/api/pins/remove/',
	  function(req, res){
	  	if (req.isAuthenticated() && req.body.username === req.user.username) {
	  		p_tables.removePin(pool, req.body.pin_id, function(err,results){
	  			if (err) {
	  				res.send({error: err});
	  			} else {
	  				res.send({pin_id: results});
	  			}
	  		});
	  	} else {
	  		res.send({message: "You are not permitted to access this content"});
	  	}
    });

}

/* This makes the method available */

module.exports = {
    setPinRoutes: setPinRoutes
};

