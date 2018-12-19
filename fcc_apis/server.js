/* Import modules */

var http = require('http');
var https = require('https');
var path = require('path');
var express = require('express');

var postgres = require('./database/postgres_main.js');
var cache = require('./database/cache.js');
var timeAPI = require('./_timestamp/api/api_time.js');
var headerAPI = require('./_header/api/api_header.js');
var fileAPI = require('./_filesize/api/api_filesize.js');
var urlAPI = require('./_urlshort/api/api_url.js');
var searchAPI = require('./_search/api/api_search.js');

/* Sets up Postgres connection pool, error watcher, and data tables */

var pool = postgres.createPool();
postgres.watchPool(pool);
postgres.createUrlTable(pool); // creates the table for the URL shortener API, if it doesn't exist //
postgres.createSearchTable(pool); // creates the table for the image search API, if it doesn't exist //

/* Sets up basic cache using node-cache */

var mem = cache.createCache();

/* Uses Express to handle routing for each static API portal */

var app = express();
app.use('/', express.static(__dirname + '/client'));
app.use('/time/', express.static(__dirname + '/_timestamp'));
app.use('/header/', express.static(__dirname + '/_header'));
app.use('/file/', express.static(__dirname + '/_filesize'));
app.use('/url/', express.static(__dirname + '/_urlshort'));
app.use('/search/', express.static(__dirname + '/_search'));

/* Uses Express to handle routing for each API endpoint */

app.get('/time/api/', function(req,res){
  timeAPI.handleTimeAPI(req,res);
});
app.get('/header/api/', function(req,res){
  headerAPI.handleHeaderAPI(req,res);
});
app.post('/file/api/', function(req,res){
  fileAPI.handleFileAPI(req,res);
});
app.get('/url/api/:handle', function(req,res){
  urlAPI.handleUrlAPI(req,res,pool);
});
app.get('/search/api/:type', function(req,res){
  searchAPI.handleSearchAPI(req,res,pool,mem);
});

/* Create a server instance and start it listening */

var server = http.createServer(app);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening on: ", addr.address + ":" + addr.port);
});
