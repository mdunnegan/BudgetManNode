var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

// custom jade route for /dashboard
router.get('/dashboard', stormpath.loginRequired, function(req, res, next) {

    var db = req.db;
    var collection = db.get('usercollection');
  
    console.log(JSON.parse(JSON.stringify(req.user)));
    var user_id = req.user.customData["mongo_id"];

    // used to query for this user. This will come from stormpath.
    collection.findOne({'_id' : user_id}, function(e, user_object){

  		res.render('dashboard', { 	
    	    title: "BudgetMan",
            username: req.user.username,
            id: JSON.stringify(user_object._id),
            budget_list: JSON.stringify(user_object['budget_elements']) // stringify turns the object retrieved from Mongo into a json object
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
