/* This creates a table for storing sessions */

function createPollsTable(pool) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS polls (" +
            "pid serial PRIMARY KEY," +
            "username varchar NOT NULL REFERENCES users(username) ON DELETE CASCADE," + 
            "poll json NOT NULL);";
        
        client.query(createTable, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
        });
    });
}

/* This saves a new poll */

function newPoll(req,poll,pool) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var addPoll = "INSERT INTO polls(username,poll) VALUES($1,$2)";
        var params = [req.user.username,poll];
            
        client.query(addPoll, params, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
        });
    });
}

/* This gets a poll from the database */

function getPoll(pid,pool,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var findPoll = "SELECT pid,username,poll FROM polls WHERE pid = $1";
        var params = [parseInt(pid)];
            
        client.query(findPoll, params, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
            if (result.rows.length == 1) {
                return callback(null,result.rows[0]);
            } else {
                return callback("No such poll",null);
            }
        });
    });
}

/* This gets all of a user's polls from the database */

function getUserPolls(username,pool,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var findPolls = "SELECT pid,username,poll FROM polls WHERE username = $1";
        var params = [username];
            
        client.query(findPolls, params, function(err, result) {
        		done();
            if(err) {
            	return callback("Error running query",null);
            } else {
            	return callback(null,result.rows);
            }
        });
    });
}

/* This gets all polls from the database */

function getAllPolls(pool,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var findPolls = "SELECT pid,username,poll FROM polls";
            
        client.query(findPolls, function(err, result) {
        		done();
            if(err) {
            	return callback("Error running query",null);
            } else {
            	return callback(null,result.rows);
            }
        });
    });
}

/* This updates a poll in the database */

function updatePoll(pid,poll,pool) {
    
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var updatePoll = "UPDATE polls SET poll = $1 WHERE pid = $2";
        var params = [poll, parseInt(pid)];
        
        client.query(updatePoll, params, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
        });
    });
}

/* This deletes a poll in the database */

function deletePoll(pid,pool) {
    
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var deletePoll = "DELETE FROM polls WHERE pid = $1";
        var params = [parseInt(pid)];
        
        client.query(deletePoll, params, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
        });
    });
}

/* This makes the database method available */

module.exports = {
    createPollsTable: createPollsTable,
    newPoll: newPoll,
    getPoll: getPoll,
    getUserPolls: getUserPolls, 
    getAllPolls: getAllPolls, 
    updatePoll: updatePoll,
    deletePoll: deletePoll
};

