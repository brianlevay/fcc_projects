/* This creates a table for users authenticated by Twitter */

function addUser(user, pool) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var searchUser = "SELECT username FROM users WHERE username = $1";
        var searchParams = [user.username];
        
        /* Check to see if the user is already in the database */
        client.query(searchUser, searchParams, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            if (result.rowCount > 0) {
                /* User is in there. */
                done();
            } else {
                // The user is not in the database. Add it //
                var addRow = "INSERT INTO users VALUES($1)";
                var addParams = [user.username];
                    
                client.query(addRow, addParams, function(err,result) {
                    if(err) {done();return console.error('error running query', err);}
                    done();
                });
            }
        });
    });
}

/* Finds a user in the database and returns a callback */

function findUser(username, pool, callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var searchUser = "SELECT * FROM users WHERE username = $1";
        var params = [username];
        
        client.query(searchUser, params, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
            if (result.rows.length >= 1) {
                return callback(null,result.rows[0]);
            } else {
                return callback("No such user",null);
            }
        });
    });
}

/* Updates a user's non-essential details */

function updateUser(user, pool, callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var updateUser = "UPDATE users SET fullname = $2, city = $3, state = $4 WHERE username = $1";
        var params = [user.username, user.fullname, user.city, user.state];
        
        client.query(updateUser, params, function(err, result) {
            done();
            if(err) {
            	console.log(err);
            	return callback("Error updating profile",null);
            } else {
            	return callback(null,"Success updating profile");
            }
        });
    });
}

/* This makes the database methods available */

module.exports = {
    addUser: addUser,
    findUser: findUser,
    updateUser: updateUser
};
