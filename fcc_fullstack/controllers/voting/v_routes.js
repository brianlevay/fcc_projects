/******************************************************************/
/* VOTING APP ROUTES */
/******************************************************************/

function setVotingRoutes(app,pool,users,v_tables,v_utils) {
    
    app.get('/voting',
      function(req, res){
        v_tables.getAllPolls(pool,function(err,pollentries){
          if (err) {console.log(err);}
          req.session.backURL = '/voting';
          res.render('./voting/v_home', { user: req.user, entries: pollentries });
        });
      });
      
    app.get('/voting/poll/:pid',
      function(req, res){
        v_tables.getPoll(req.params.pid,pool,function(err,pollentry){
          if (err) {
            res.send(err);
          } else {
            res.render('./voting/v_poll', { user: req.user, entry: pollentry });
          }
        });
      });  
      
    app.get('/voting/profile/:username',
      function(req, res){
        users.findUser(req.params.username,pool,function(err,user){
          if (err) {
            res.send(err);
          } else {
            v_tables.getUserPolls(req.params.username,pool,function(err,pollentries){
              if (err) {console.log(err);}
              req.session.backURL = '/voting/profile/' + req.params.username;
              res.render('./voting/v_profile', { user: req.user, profile: req.params.username, entries: pollentries });
            });
          }
        });
      });  
      
    app.get('/voting/create',
      function(req, res){
        res.render('./voting/v_create', {user: req.user });
      });
      
    app.post('/voting/new',
      function(req, res){
        if (req.isAuthenticated()) {
          var poll = v_utils.createJSONpoll(req.body);
          if (poll["title"] != "") {
            v_tables.newPoll(req,poll,pool);
            res.redirect('/voting');
          } else {
            res.redirect('/voting/create');
          }
        } else {
          res.send('You do not have permission to access this page.');
        }
      });
      
    app.post('/voting/update',
      function(req, res){
        var poll = v_utils.updateJSONpoll(req.body);
        v_tables.updatePoll(req.body.pid,poll,pool);
        res.redirect(req.session.backURL);
      });
      
    app.post('/voting/delete',
      function(req, res){
        if (req.isAuthenticated() && req.user.username == req.body.username) {
          v_tables.deletePoll(req.body.pid,pool);
          if (req.session.backURL.search('profile') > -1) {
          	res.redirect(req.session.backURL);
          } else {
          	res.redirect('/voting');
          }
        } else {
          res.send('You do not have permission to delete this poll.');
        }
      });
}

/* This makes the method available */

module.exports = {
    setVotingRoutes: setVotingRoutes
};

