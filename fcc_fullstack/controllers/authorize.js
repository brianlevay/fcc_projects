/* Import modules */

var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

/* Setup Passport for Twitter login */

function setUpPassport(passport, pool, users) {
    
		passport.use(new LocalStrategy(
    function(username, password, cb) {
        var user = {username: "test_user"};
        users.addUser(user, pool);
        return cb(null, user);
    }));
    
    passport.use(new TwitterStrategy({
        consumerKey: process.env.TW_CONSUMER_KEY,
        consumerSecret: process.env.TW_CONSUMER_SECRET,
        callbackURL: process.env.HOST_URL + '/login/twitter/callback'
    },
    function(token, tokenSecret, profile, cb) {
        var user = {username: profile.username};
        users.addUser(user, pool);
        return cb(null, user);
    }));
    
    passport.serializeUser(function(user, cb) {
      cb(null, user);
    });
    
    passport.deserializeUser(function(user, cb) {
      users.findUser(user.username,pool,function(err,entry){
      	if (err) {console.log(err);}
      	cb(null, entry);
      });
    });
    
}

/* This makes the function available */

module.exports = {
    setUpPassport: setUpPassport
};

