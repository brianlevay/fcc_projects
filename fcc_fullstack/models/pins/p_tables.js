/* This creates a table for storing user walls */

function createWallsTable(pool, callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS walls (" +
            "wall_id serial PRIMARY KEY," +
            "wallname text NOT NULL," + 
            "username text NOT NULL REFERENCES users(username) ON DELETE CASCADE," + 
            "edited timestamp NOT NULL);";
        
        client.query(createTable, function(err, result) {
        		done();
            if(err) {return console.error('error running query', err);}
            return callback();
        });
    });
}

/* This creates a table for storing copies of books and their status */

function createPinsTable(pool) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS pins (" +
            "pin_id serial PRIMARY KEY," +
            "wall_id integer NOT NULL REFERENCES walls(wall_id) ON DELETE CASCADE," + 
            "image_url text NOT NULL," +
            "comment text);";
        
        client.query(createTable, function(err, result) {
        		done();
            if(err) {return console.error('error running query', err);}
        });
    });
}

/* This gets a set of most recent walls and pins */

function getTop(pool,num,callback) {
	
		pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var getTop = 
        		"SELECT recent.wall_id, recent.wallname, recent.username, pins.pin_id, pins.image_url, pins.comment " + 
        		"FROM (" +
        			"SELECT * FROM walls ORDER BY edited LIMIT $1" + 
        		") AS recent LEFT OUTER JOIN pins " + 
        		"ON pins.wall_id = recent.wall_id";
        var topParams = [num];
        
        client.query(getTop, topParams, function(err, result) {
            done();
            if(err) {
                return callback("Error getting top walls",null);
            } else {
            		return callback(null,result.rows);
            }
        });
    });
}

/* This gets all of a user's walls and pins */

function getCollection(pool,username,callback) {
	  
	  pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var getCollection = 
            "SELECT walls.wall_id, walls.wallname, walls.username, pins.pin_id, pins.image_url, pins.comment " + 
            "FROM walls LEFT OUTER JOIN pins " + 
            "ON walls.wall_id = pins.wall_id " +
            "WHERE walls.username = $1";
        var collectionParams = [username];
        
        client.query(getCollection, collectionParams, function(err, result) {
            done();
            if(err) {
                return callback("Error getting collection",null);
            } else {
            		return callback(null,result.rows); 
            }
        });
    });
}

/* This gets a particular wall */

function getWall(pool,username,wallname,callback) {
	
		pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var getWall = 
		    	"SELECT walls.wall_id, walls.wallname, walls.username, pins.pin_id, pins.image_url, pins.comment " + 
		    	"FROM walls LEFT OUTER JOIN pins " + 
		    	"ON pins.wall_id = walls.wall_id " +
		      "WHERE walls.username = $1 AND walls.wallname = $2";
		  	var wallParams = [username, wallname];
        
        client.query(getWall, wallParams, function(err, result) {
            done();
            if(err) {
                return callback("Error getting wall",null);
            } else {
            		if (result.rows.length === 0) {
	            			return callback("Wall does not exist",null);
            		} else {
            				return callback(null,result.rows);
            		}
            }
        });
    });
}

/* This creates a new wall */

function createNewWall(pool,wallname,username,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var addWall = 
            "INSERT INTO walls(wallname,username,edited) SELECT $1, $2, $3 " + 
            "WHERE NOT EXISTS (SELECT wallname FROM walls WHERE wallname = $1 AND username = $2) " + 
            "RETURNING wall_id";
        var wallParams = [wallname, username, new Date()];
        
        client.query(addWall, wallParams, function(err, result) {
            done();
            if(err) {
                return callback("Error adding wall",null);
            } else {
            		if (!result.rows[0]) {
            				return callback("Wall already exists",null);
            		} else {
                		return callback(null,result.rows[0].wall_id);
            		}
            }
        });
    });
}

/* This deletes a wall */

function deleteWall(pool,wallname,username,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var deleteWall = 
            "DELETE FROM walls WHERE wallname = $1 AND username = $2 RETURNING wall_id";
        var wallParams = [wallname, username];
        
        client.query(deleteWall, wallParams, function(err, result) {
            done();
            if(err) {
                return callback("Error deleting wall",null);
            } else {
            		if (!result.rows[0]) {
            				return callback("You do not have permission to delete this wall",null);
            		} else {
                		return callback(null,result.rows[0].wall_id);
            		}
            }
        });
    });
}

/* This adds a pin and updates the edited parameter for the wall */

function addPin(pool,wall_id,image_url,comment,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var addPin = 
            "INSERT INTO pins VALUES(DEFAULT,$1,$2,$3) RETURNING pin_id";
        var addParams = [parseInt(wall_id), image_url, comment];
        
        client.query(addPin, addParams, function(err, result) {
            if(err) {
            		done();
                return callback("Error adding pin",null);
            } else {
            		var updateWall = 
            				"UPDATE walls SET edited = $1 WHERE wall_id = $2";
            		var updateParams = [new Date(), parseInt(wall_id)];
            		
            		client.query(updateWall, updateParams, function(err,success) {
            				done();
            				if (err) {
            						return callback("Error updating wall table", null);
            				} else {
            						return callback(null,result.rows[0]);
            				}
            		});
            }
        });
    });
}

/* This removes a pin */

function removePin(pool,pin_id,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var removePin = 
            "DELETE FROM pins WHERE pin_id = $1 RETURNING pin_id";
        var removeParams = [parseInt(pin_id)];
        
        client.query(removePin, removeParams, function(err, result) {
            done();
            if(err) {
                return callback("Error removing pin",null);
            } else {
            		return callback(null,result.rows[0]);
            }
        });
    });
}

/* This makes the database method available */

module.exports = {
    createWallsTable: createWallsTable,
    createPinsTable: createPinsTable,
    getTop: getTop,
    getCollection: getCollection,
    getWall: getWall,
    createNewWall: createNewWall, 
    deleteWall: deleteWall,
    addPin: addPin,
    removePin: removePin
};

