/* searches TABLE format: id (key), time, searchterms */
            
/* Adds a new search to the database */

function addSearch(searchString,pool) {
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var date = new Date();
        var dateStr = date.toLocaleString();
        dateStr = dateStr.replace(' at','');
        dateStr = dateStr.replace(',','');
        var addNew = 
            "INSERT INTO searches(time,searchterms) VALUES" + 
            "('" + dateStr + "','" + searchString + "')";
        
        client.query(addNew, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            done();
        });
    });
}

/* This gets recent search results */

function getRecentSearches(res,pool) {
    pool.connect(function(err, client, done) {
        if(err) {return console.error('error fetching client from pool', err);}
        var getRecent = 
            "SELECT time,searchterms FROM searches ORDER BY time DESC LIMIT 10";

        client.query(getRecent, function(err, result) {
            if(err) {done();return console.error('error running query', err);}
            res.send(result.rows);
            done();
        });
    });
}

/* This makes the database methods available */

module.exports = {
    addSearch: addSearch,
    getRecentSearches: getRecentSearches
};
