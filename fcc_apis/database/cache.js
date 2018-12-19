/* Import modules */

var nodeCache = require('node-cache');

function createCache() {
    var cache = new nodeCache();
    return cache;
}

/* This makes the function available */

module.exports = {
    createCache: createCache
};
