/* This creates a table for storing sessions */

function createBooksTable(pool, callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS books (" +
            "book_id text PRIMARY KEY," +
            "isbn13 text NOT NULL," + 
            "title text NOT NULL," + 
            "authors text NOT NULL," + 
            "image_url text NOT NULL," + 
            "info_url text NOT NULL);";
        
        client.query(createTable, function(err, result) {
        		done();
            if(err) {done();return console.error('error running query', err);}
            return callback();
        });
    });
}

/* This creates a table for storing copies of books and their status */

function createCopiesTable(pool) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS copies (" +
            "copy_id serial PRIMARY KEY," +
            "book_id text NOT NULL REFERENCES books(book_id) ON DELETE CASCADE," + 
            "username text NOT NULL REFERENCES users(username) ON DELETE CASCADE," + 
            "requested_by text NOT NULL DEFAULT 'none');";
        
        client.query(createTable, function(err, result) {
        		done();
            if(err) {done();return console.error('error running query', err);}
        });
    });
}

/* This creates a new book copy */

function createNewCopy(pool,book,user,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var addBook = 
            "INSERT INTO books SELECT $1, $2, $3, $4, $5, $6 " + 
            "WHERE NOT EXISTS (SELECT book_id FROM books WHERE book_id = $1)";
        var bookParams = [book.book_id, book.isbn13, book.title, book.authors, book.image_url, book.info_url];
        
        client.query(addBook, bookParams, function(err, result) {
            if(err) {
                done();
                console.log(err);
                return callback("Error adding book",null);
            } else {
                var addCopy = 
                		"INSERT INTO copies(copy_id,book_id,username,requested_by) " + 
                		"VALUES(DEFAULT,$1,$2,DEFAULT) RETURNING copy_id";
                var copyParams = [book.book_id, user.username];
                
                client.query(addCopy, copyParams, function(err, result) {
                		done();
                		if (err) {
                			return callback("Error adding copy",null);
                		} else {
                			return callback(null,result.rows[0].copy_id);
                		}
                });
            }
        });
    });
}

/* This removes a book copy */

function removeCopy(pool,copy_id,user,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var removeCopy = 
            "DELETE FROM copies WHERE copy_id = $1 AND username = $2";
        var copyParams = [copy_id, user.username];
        
        client.query(removeCopy, copyParams, function(err, result) {
        		done();
            if(err) {
                console.log(err);
                return callback("Error removing copy",null);
            } else {
                return callback(null,"Success removing copy");
            }
        });
    });
}

/* This gets all copies owned by a user and all copies requested by a user */

function getUserCopies(pool,user,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var getCopies = 
            "SELECT * FROM copies,books,users WHERE " + 
            "copies.book_id = books.book_id AND copies.username = users.username AND users.username = $1";
        var copyParams = [user.username];
        
        client.query(getCopies, copyParams, function(err, myCopies) {
        		if(err) {
        				done();
                console.log(err);
                return callback("Error getting coppies",null);
            } else {
            		var getRequests = 
            				"SELECT * FROM copies,books,users WHERE " + 
            				"copies.book_id = books.book_id AND copies.username = users.username AND copies.requested_by = $1";
        				var requestParams = [user.username];
        				
        				client.query(getRequests, requestParams, function(err, myRequests) {
        						done();
        						if(err) {
        							console.log(err);
        							return callback("Error getting your requests",null);
        						} else {
        							var results = {myCopies: myCopies.rows, myRequests: myRequests.rows};
        							return callback(null,results);
        						}
        				});
            }
        });
    });
}

/* This gets a number-limited list of copies owned by all users that are available for trade */

function getAllCopiesForTrade(pool,start,num,callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var getCopies = 
            "SELECT * FROM copies,books,users WHERE " + 
            "copies.book_id = books.book_id AND copies.username = users.username " + 
            "AND copies.requested_by = 'none'" + 
            "ORDER BY copies.copy_id OFFSET $1 LIMIT $2";
        var copyParams = [start, num];
        
        client.query(getCopies, copyParams, function(err, result) {
        		done();
            if(err) {
                console.log(err);
                return callback("Error getting coppies",null);
            } else {
                return callback(null,result.rows);
            }
        });
    });
}

/* This toggles the requested_by property of a copy */

function toggleRequest(pool, copy_id, username, cancel, callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var query, params;
        if (cancel === "false") {
        	query = "UPDATE copies SET requested_by = $1 WHERE copy_id = $2 AND username <> $1";
        	params = [username, copy_id];
        } else {
        	query = "UPDATE copies SET requested_by = $1 WHERE copy_id = $2";
        	params = ["none", copy_id];
        }
        
        client.query(query, params, function(err, result) {
        		done();
            if(err) {
                console.log(err);
                return callback("Error changing request",null);
            } else {
                return callback(null,"Success changing request");
            }
        });
    });
}

/* This gets all copies available for trade from a particular user */

function viewTradeOpts(pool, username, callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var viewTradeOpts = 
            "SELECT * FROM copies,books,users WHERE " + 
            "copies.book_id = books.book_id AND copies.username = users.username AND " + 
            "users.username = $1 AND copies.requested_by = $2";
        var viewParams = [username, "none"];
        
        client.query(viewTradeOpts, viewParams, function(err, result) {
        		done();
            if(err) {
                console.log(err);
                return callback("Error getting trade options",null);
            } else {
                return callback(null,result.rows);
            }
        });
    });
}

/* This trades a pair of copies, or transfers ownership if only one copy_id provided */

function tradeCopies(pool, myTrade, otherTrade, callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var giveMyTrade = 
            "UPDATE copies SET username = $1, requested_by = $2 WHERE copy_id = $3";
        var giveParams = [myTrade.requested_by, "none", myTrade.copy_id];
        
        client.query(giveMyTrade, giveParams, function(err, result) {
        		if(err) {
        				done();
                console.log(err);
                return callback("Error trading copy 1",null);
            } else {
            		if (!otherTrade) {
            			done();
                	return callback(null,"Copy 1 given away");
            		} else {
            			var getOtherTrade = 
            					"UPDATE copies SET username = $1, requested_by = $2 WHERE copy_id = $3";
            			var getParams = [myTrade.username, "none", otherTrade.copy_id];
            			
            			client.query(getOtherTrade, getParams, function(err, result) {
            					done();
            					if (err) {
            						console.log(err);
            						return callback("Error trading copy 2", null);
            					} else {
            						return callback(null,"Copies 1 and 2 traded");
            					}
            			});
            		}
            }
        });
    });
}

/* This makes the database method available */

module.exports = {
    createBooksTable: createBooksTable,
    createCopiesTable: createCopiesTable,
    createNewCopy: createNewCopy,
    removeCopy: removeCopy,
    getUserCopies: getUserCopies,
    getAllCopiesForTrade: getAllCopiesForTrade,
    toggleRequest: toggleRequest,
    viewTradeOpts: viewTradeOpts,
    tradeCopies: tradeCopies
};

