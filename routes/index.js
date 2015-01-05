var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// stormpath route only visible to logged-in users. replaced by dashboard
// router.get('/secret', stormpath.loginRequired, function(req, res) {
//   res.send("If you're seeing this page, you must be logged in!");
// });

// custom jade route for /budget
router.get('/dashboard', stormpath.loginRequired, function(req, res) {

  var db = req.db;
  var collection = db.get('usercollection');
  collection.find({},{},function(e,docs){
  	req.user.customData['woot'] = 10.202223;
  	req.user.save;

	res.send({ 
  	  title: req.user.customData['woot'], // holy shit this actually worked!
      username: req.user.username,
	  "userlist" : docs
	});
  });
});

// stormpath route only reachable by an admin
router.get('/admins', stormpath.groupsRequired(['admins']), function(req, res) {
  res.send('If you can see this page, you must be in the `admins` group!');
});

// stormpath route only reachable by free user admins (both)
router.get('/free_users_and_admins', stormpath.groupsRequired(['free users', 'admins']), function(req, res) {
  res.send('If you can see this page, you must be in the `free users` and `admins` group!');
});

// route that demonstrates how to access user data. Requires login (sooo sick!)
router.get('/email', stormpath.loginRequired, function(req, res) {
  res.send('Your email address is:', req.user.email);
});

module.exports = router;
