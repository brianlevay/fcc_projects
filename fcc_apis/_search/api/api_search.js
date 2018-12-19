/* Import modules */

var util = require('./utilities.js');
var db = require('./db_search.js');

/* This is the main event handling logic for the image search API endpoint */
/* If search terms are paseed: 
  (1) check cache, if search terms in there, return appropriate page [array index] 
  (2) if cache empty, make API call, 
  (3) chop API results into pages, store in cache, return appropriate page 
  (4) store only new API calls in Postgres searches table to avoid unnecessary
      duplicates when getting paginated results from cache - note, there's probably 
      a better solution, but this works for a non-production environment 
*/

function handleSearchAPI(req,res,pool,mem) {
  var type = req.params.type;
  var searchTerms = req.query.text;
  var pageStr = req.query.offset;
  var pageNum = 1;
  
  if (type == "new") {
    if (searchTerms) {
      var searchCleaned = searchTerms.replace(/[<>]/g," ");
      var searchString = encodeURI(searchCleaned).replace(/%20/g,"+").replace(/'/g, "%27");
      if (pageStr) {
        pageNum = parseInt(pageStr);
        if (pageNum <= 0) {pageNum = 1;}
      } else {
        pageNum = 1;
      }
      
      var results = mem.get(searchString);
      if (results) {
        console.log("Using the cache...");
        if (results.length > 0) {
          if (pageNum > results.length) {pageNum = results.length;}
          res.send(results[pageNum-1]);
        } else {
          res.send("No results found.");
        }
      } else {
        console.log("New API call...");
        util.getDataFromAPI(searchString,pageNum,res,pool,mem);
      }
      searchTerms = "";
      pageStr = "";
    } else {
      res.send("No search terms entered");
    }
  } else if (type == "recent") {
    db.getRecentSearches(res,pool);
  } else {
    res.send("Error. Incorrect url format for an API call.");
  }
}

/* This makes the function available */

module.exports = {
    handleSearchAPI: handleSearchAPI
};
