/* Import modules */

var db = require('./url_db.js');
var tools = require('./url_tools.js');

/* Main API handler */

function handleUrlAPI(req,res,pool) {
  var handle = req.params.handle;
  var url = req.query.url;
  if (handle == "new") {
    if (url) {
      var valid = tools.checkURL(url);
      if (valid) {
        db.newShortcut(url,res,pool);
      } else {
        res.send("The URL that you entered does not appear to have a valid format. Please try again.");
      }
    } else {
      res.send("You did not format your query correctly, or you did not add a url to shorten. Please try again");
    }
  } else {
    db.redirectURL(handle,res,pool);
  }
}

/* This makes the database methods available */

module.exports = {
    handleUrlAPI: handleUrlAPI
};

