/******************************************************************/
/* NIGHTLIFE APP ROUTES */
/******************************************************************/

function setNightRoutes(app,pool,yelp,n_tables,n_utils) {

    app.get('/nightlife',
      function(req, res){
      	req.session.backURL = '/nightlife';
      	var location = "";
      	if (req.session.yelpLOC && req.session.yelpLOC != "") {location = req.session.yelpLOC;}
      	res.render('./nightlife/n_home', {user: req.user, loc: location });
      });
      
    app.get('/nightlife/search/',
      function(req, res){
      	req.session.yelpLOC = req.query.place;
      	yelp.search({category_filter: "bars", location: req.query.place}, function(err,data){
      		if(err) {
      			res.send(err);
      		} else {
      			res.send(data.businesses);
      		}
      	});
      });
      
     app.post('/nightlife/whoisgoing',
      function(req, res){
      	var barList = req.body.barList;
      	var username = "visitor";
      	var auth = false;
      	if (req.isAuthenticated()) {
      		auth = true; 
      		username = req.user.username;
      	}
      	n_tables.getAttending(barList,pool,function(err,result){
      		if (err) {
      			console.log(err);
      			res.send(err);
      		} else {
      			var list = n_utils.processGoing(barList,result.rows);
        		res.send({ username: username, auth: auth, list: list });
      		}
        });
      });
      
     app.post('/nightlife/update',
      function(req, res){
      	if (req.isAuthenticated()) {
      		n_tables.updateAttend(req,pool);
      		res.send("Success!");
      	} else {
      		res.send("You don't have permission to perform this action.");
      	}
      });

}

/* This makes the method available */

module.exports = {
    setNightRoutes: setNightRoutes
};

