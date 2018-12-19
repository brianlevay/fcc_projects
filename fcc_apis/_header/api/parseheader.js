/* This is the main function that parses the header and returns the desired values */

function userDetails(headers) {
    /* Need IP address, language, and operating system for browser */
    var ipHdr = headers['x-forwarded-for'];
    var langHdr = headers['accept-language'].split(',');
    var browserHdr = headers['user-agent'].split(/[()]/g);
    var lang = langHdr[0];
    var os = browserHdr[1];
    
    return {ip_address: ipHdr, language: lang, operating_system: os};
}

/* This makes the function available */

module.exports = {
    userDetails: userDetails
};
