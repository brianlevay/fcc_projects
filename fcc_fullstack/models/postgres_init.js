/* Import modules */

var pg = require('pg');

/* This creates a pool of database connections, as recommended by the Node-Postgres documentation */

function createPool() {
    /* format of url = postgres://username:password@host:port/dbname */
    var connection = process.env.DATABASE_URL;
    var mainParts = connection.split(/\/+/);
    var pathParts = mainParts[1].split(/[:@]/);
    var config = {
        user: pathParts[0],
        password: pathParts[1],
        host: pathParts[2],
        port: pathParts[3],
        database: mainParts[2],
        max: 10,
        idleTimeoutMillis: 30000,
    };
    var pool = new pg.Pool(config);
    return pool;
}

/* This creates an error watcher on the thread pool, as suggested by the Node-Postgres documentation */

function watchPool(pool) {
    pool.on('error', function (err, client) {
        console.error('idle client error', err.message, err.stack);
    });
}

/* This creates a table for storing sessions */

function createSessionsTable(pool, callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS session (" +
            "sid varchar PRIMARY KEY," +
            "sess json NOT NULL," +
            "expire timestamp(6) NOT NULL);";
        
        client.query(createTable, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
            return callback();
        });
    });
}

/* This creates a table for users authenticated by Twitter */

function createUsersTable(pool, callback) {

    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS users (" +
            "username varchar PRIMARY KEY," + 
            "fullname varchar," + 
            "city varchar," + 
            "state varchar);";
        
        client.query(createTable, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
            return callback();
        });
    });
}

/* This makes the database methods available */

module.exports = {
    createPool: createPool,
    watchPool: watchPool, 
    createSessionsTable: createSessionsTable,
    createUsersTable: createUsersTable
};
