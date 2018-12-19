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
        console.error('idle client error', err.message, err.stack)
    });
}

/* This creates a new "shortcuts" table if one does not already exist */

function createUrlTable(pool) {

    // Connect to the database //
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS shortcuts (" +
            "id serial primary key," +
            "handle char(6) not null," +
            "url text not null);";
        
        // The create table query is run, and if the table doesn't exist, it will be built //
        client.query(createTable, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
        });
    });
}

/* This creates a new "shortcuts" table if one does not already exist */

function createSearchTable(pool) {

    // Connect to the database //
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var createTable = 
            "CREATE TABLE IF NOT EXISTS searches (" +
            "id serial primary key," +
            "time timestamp with time zone not null," +
            "searchterms text not null);";
        
        // The create table query is run, and if the table doesn't exist, it will be built //
        client.query(createTable, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
        });
    });
}

/* This makes the database methods available */

module.exports = {
    createPool: createPool,
    watchPool: watchPool,
    createUrlTable: createUrlTable,
    createSearchTable: createSearchTable
};
