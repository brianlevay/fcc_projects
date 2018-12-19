/* Import modules */

var parser = require('./parseheader.js');

/* This is the main event handling logic for the header API endpoint */

function handleHeaderAPI(req,res) {
    var headers = req.headers;
    var output = parser.userDetails(headers);
    res.send(output);
}

/* This makes the function available */

module.exports = {
    handleHeaderAPI: handleHeaderAPI
};

