/* This does a bare-bones check to see if a URL has a valid format
Minimum elements of a valid url (will still allow incorrect addresses!): 
    (1) Starts with 'http://' or 'https://'
    (2) Contains at least one alphanumeric character immediately after 'http(s)://'' 
    (3) Contains at least one '.' to signal domain. 
*/ 

function checkURL(url) {
    var valid = false;
    var tag = url.search(/[<>]/g);
    
    var http = url.search('http://');
    var https = url.search('https://');
    var dot = url.search(/\./);
    
    function checkRest(pos) {
        var char = url.charCodeAt(pos);
        if ((char >= 48 && char <= 57) || 
            (char >= 65 && char <= 90) || 
            (char >= 97 && char <= 122)) {
            if (dot > pos) {
                valid = true;
            }
        }
    }
    if (tag === -1) {
        if (http === 0) {checkRest(7);}
        if (https === 0) {checkRest(8);}
    }
    return valid;
}

/* This generates the shortened URL handle using a custom counter. 
It uses a 6-digit string that can have values of a-z, A-Z, or 0-9 
at each position. The starting values are staggered, and each 
digit is incremented and cycled through all 62 possibilities. To 
avoid pattern repetition, however, the cycles are "shifted" according 
to the value of the table id. More than 10,0000 sequential entries were 
tested, and no value ever repeated. */

function generateHandle(id) {
    var floorDiv = [1000000,100000,10000,1000,100,10];
    var shift = [0,12,39,7,13,41];
    var counters = [0,0,0,0,0,0];
    var codes = [48,48,48,48,48,48];
    var chars = ["0","0","0","0","0","0"];
    
    for (var i = 0; i < 6; i++) {
      counters[i] = (id + shift[i] - 1 + Math.floor(id/floorDiv[i])) % 62;
      if (counters[i] < 10) {
          codes[i] = counters[i] + 48;  // converts first ten numbers to num charcodes //
          chars[i] = String.fromCharCode(codes[i]);
      } else if (counters[i] >= 10 && counters[i] < 36) {
          codes[i] = counters[i] - 10 + 65;  // converts next 26 numbers to cap charcodes //
          chars[i] = String.fromCharCode(codes[i]);
      } else if (counters[i] >= 36 && counters[i] < 62) {
          codes[i] = counters[i] - 36 + 97; // converts last 26 numbers to small charcodes //
          chars[i] = String.fromCharCode(codes[i]);
      }
    }
    
    var handle = chars.join('');
    return handle;
}

/* This makes the tools methods available */

module.exports = {
    checkURL: checkURL,
    generateHandle: generateHandle
};