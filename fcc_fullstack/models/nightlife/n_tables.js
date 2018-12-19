/* This creates a table for storing bars that people are going to */

function createBarsTable(pool) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS bars (" +
            "bar_id varchar NOT NULL," +
            "username varchar NOT NULL REFERENCES users(username) ON DELETE CASCADE," + 
            "utcdate timestamp NOT NULL);";
        
        client.query(createTable, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
            pruneBars(pool);
            var timer = setInterval(function(){pruneBars(pool);},(12 * 60 * 60 * 1000));
        });
    });
}

/* This removes old bar commitments from the database */

function pruneBars(pool) {
	
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var now = new Date();
        var expired = new Date(now.getFullYear(),now.getMonth(),now.getDate()-1,0,0);
        var pruneBars = "DELETE FROM bars WHERE utcdate < $1";
        var params = [expired];
            
        client.query(pruneBars, params, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
        });
    });
}

/* This removes old bar commitments from the database */

function updateAttend(req, pool) {
	
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var addGoing = "INSERT INTO bars VALUES($1,$2,$3)";
        var removeGoing = "DELETE FROM bars WHERE bar_id = $1 AND username = $2 AND UTCdate = $3";
        var params = [req.body.bar, req.user.username, req.body.date];
        
        var query = addGoing;
        if (req.body.response == "NOT") {query = removeGoing;}
        
        client.query(query, params, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
        });
    });
}

/* This gets the list of people attending for each bar in the Yelp search results */

function getAttending(barList,pool,callback) {
	
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var findGoing = "SELECT bar_id,username,utcdate FROM bars WHERE ";
        var params = [];
        for (var i=0, len=barList.length; i<len; i++) {
            findGoing += "bar_id = $" + (i+1);
            params.push(barList[i]);
            if (i != len-1) {findGoing += " OR ";}
        }
        
        client.query(findGoing, params, function(err, result) {
            if(err) {done();return callback(err,null);}
            done();
            return callback(null,result);
        });
    });
}

/* This makes the database method available */

module.exports = {
    createBarsTable: createBarsTable,
    updateAttend: updateAttend,
    getAttending: getAttending
};

