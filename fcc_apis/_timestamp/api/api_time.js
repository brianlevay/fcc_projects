/* Import modules */

var time = require('./timestamp.js');

/* This is the main event handling logic for the timestamp API endpoint */

function handleTimeAPI(req,res) {
  if (req.query.date) {
    var queryStr = req.query.date;
    var output = time.timeStamp(queryStr);
    res.send(output);
  } else {
    res.send("Improper API call syntax. Please refer to the instructions on the home page.");
  }
}

/* This makes the function available */

module.exports = {
    handleTimeAPI: handleTimeAPI
};
