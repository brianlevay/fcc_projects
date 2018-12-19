/* Import modules */

var tools = require('./url_tools.js');

/* This handles new url requests by: 
(1) connecting to the database,
(2) searching to see if the URL is already associated with a handler (and returning it),
(3) if the URL is not already stored, it gets the highest id (key) value from the DB,
(4) it uses that key+1 and a conversion algorithm to generate a new unique handler 
(5) it then adds the handler + url to the database and returns the new shortened path */
        
function newShortcut(url,res,pool) {
    
    // Connect to the database //
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var searchURL = 
            "SELECT handle FROM shortcuts WHERE url = '" + url + "'";
        
        // Check to see if the url is already in the database //
        client.query(searchURL, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            
            if (result.rowCount > 0) {
                // The url is already in the database. Send back the base url + handle //
                var shortpath = process.env.HOST_URL + "/url/api/" + result.rows[0].handle;
                res.send(shortpath);
                done();
                
            } else {
                // The url is not in the database. Add it //
                var maxID = 'SELECT MAX(id) FROM "shortcuts"';
                
                // Find the maximum id value in the table //
                client.query(maxID, function(err,result) {
                    if(err) {done();return console.error('error running query', err);}
                    
                    var newId = result.rows[0].max + 1;
                    var handle = tools.generateHandle(newId);
                    var addRow = 
                        "INSERT INTO shortcuts(handle,url) VALUES" + 
                        "('" + handle + "','" + url + "')";
                    
                    // Add the url and new handle to the database //
                    client.query(addRow, function(err,result) {
                        if(err) {done();return console.error('error running query', err);}
                        
                        var shortpath = process.env.HOST_URL + "/url/api/" + handle;
                        res.send(shortpath);
                        done();
                    });
                });
            }
        });
    });
}

/* This deals with redirect requests when a :handle is added. 
It checks whether the handle is valid (in the database), 
and if so, it redirects to the accompanying url */

function redirectURL(handle,res,pool) {
    
    // Connect to the database //
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var searchHandle = 
            "SELECT url FROM shortcuts WHERE handle = '" + handle + "'";
        
        // Check to see if the handle exists in the database //
        client.query(searchHandle, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            
            if (result.rowCount > 0) {
                // The handle is in the database. Redirect to the associated url //
                var url = result.rows[0].url;
                res.redirect(url);
                done();
            } else {
                res.send("That shortened URL was not found. Please try again.");
                done();
            }
        });
    });
}

/* This makes the database methods available */

module.exports = {
    newShortcut: newShortcut,
    redirectURL: redirectURL
};
