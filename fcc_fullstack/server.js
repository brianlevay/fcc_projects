/******************************************************************/
/* IMPORT DEPENDENCIES */
/******************************************************************/

/* Import node modules */

var http = require('http');
var https = require('https');
var express = require('express');
var socketio = require('socket.io');
var passport = require('passport');
var pg = require('pg');
var PostgresStore = require('connect-pg-simple')(express.session);
var Yelp = require('yelp');

/* Import custom utility modules */

var auth = require('./controllers/authorize.js');
var v_utils = require('./controllers/voting/v_utils.js');
var n_utils = require('./controllers/nightlife/n_utils.js');
var s_utils = require('./controllers/stocks/s_utils.js');
var b_utils = require('./controllers/books/b_utils.js');
var p_utils = require('./controllers/pins/p_utils.js');

/* Import custom database modules */

var postgres = require('./models/postgres_init.js');
var users = require('./models/users.js');
var v_tables = require('./models/voting/v_tables.js');
var n_tables = require('./models/nightlife/n_tables.js');
var b_tables = require('./models/books/b_tables.js');
var p_tables = require('./models/pins/p_tables.js');

/* Import route modules */

var v_routes = require('./controllers/voting/v_routes.js');
var n_routes = require('./controllers/nightlife/n_routes.js');
var s_routes = require('./controllers/stocks/s_routes.js');
var b_routes = require('./controllers/books/b_routes.js');
var p_routes = require('./controllers/pins/p_routes.js');

/******************************************************************/
/* DATABASE SETUP */
/******************************************************************/

/* Sets up Postgres connection pool, error watcher, and creates required data tables */

var pool = postgres.createPool();
postgres.watchPool(pool);
postgres.createSessionsTable(pool, function() {
	postgres.createUsersTable(pool, function() {
		v_tables.createPollsTable(pool);
		n_tables.createBarsTable(pool);
		b_tables.createBooksTable(pool, function() {
			b_tables.createCopiesTable(pool);
		});
		p_tables.createWallsTable(pool, function() {
			p_tables.createPinsTable(pool);
		});
	});
});

/* Sets up a simple local memory cache */

var cache = {};
cache.stocks = {};

/******************************************************************/
/* PASSPORT AND EXPRESS SETUP */
/******************************************************************/

/* Sets up passport */

auth.setUpPassport(passport,pool,users);

/* Sets up session parameters */

var sessionOptions = {
  secret: process.env.COOKIE_SECRET,
  cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 }, // 2 days
  resave: false,
  saveUninitialized: false,
  store: new PostgresStore({pg: pg})
};

/* Creates express, server, and io instances */

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

/* Configures express */

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.static(__dirname + '/views'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());
});

/******************************************************************/
/* YELP API PACKAGE SETUP */
/******************************************************************/

var yelp = new Yelp({
	consumer_key: process.env.YELP_CONSUMER_KEY, 
	consumer_secret: process.env.YELP_CONSUMER_SECRET,
	token: process.env.YELP_TOKEN,
	token_secret: process.env.YELP_TOKEN_SECRET
});

/******************************************************************/
/* HOME AND AUTH ROUTES */
/******************************************************************/

app.get('/', 
  function(req, res) {
    req.session.backURL = '/';
    res.render('home', { user: req.user });
  });

app.get('/logout', 
  function(req, res){
    req.logout();
    res.redirect(req.session.backURL);
  });
  
app.post('/login/visitor', 
  passport.authenticate('local'),
  function(req, res) {
    res.redirect(req.session.backURL);
  });
  
app.get('/login/twitter', 
  passport.authenticate('twitter'));

app.get('/login/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect(req.session.backURL);
  });

/******************************************************************/
/* APP ROUTES */
/******************************************************************/

v_routes.setVotingRoutes(app,pool,users,v_tables,v_utils); /* Voting App */
n_routes.setNightRoutes(app,pool,yelp,n_tables,n_utils); /* Nightlife App */
s_routes.setStockRoutes(app,cache,io,https,s_utils); /* Stock Charting App */
b_routes.setBookRoutes(app,pool,https,users,b_tables,b_utils); /* Book Trading App */
p_routes.setPinRoutes(app,pool,users,p_tables,p_utils); /* Photo Pinning App */

/******************************************************************/
/* STARTS SERVER */
/******************************************************************/

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});

/******************************************************************/
/* END OF SCRIPT */
/******************************************************************/

