/* Import modules */

var fs = require('fs');
var multer = require('multer');

/* Sets up multer */

var upload = multer({ dest: 'tmp/' }).single('fileUpload');

/* This is the main event handling logic for the header API endpoint */

function handleFileAPI(req,res) {
    upload(req,res,function(err){
        if (err) {res.send("Error during upload.");return;}
        res.send(JSON.stringify(req.file.size));
        fs.unlink(req.file.path);
    });
}

/* This makes the function available */

module.exports = {
    handleFileAPI: handleFileAPI
};
