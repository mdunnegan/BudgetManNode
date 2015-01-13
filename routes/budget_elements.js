/*
 *	The user does not see these routes. He sees /budget, which is handles elsewhere. These routes handle REST methods
 */

var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');

router.get('/elements', stormpath.loginRequired, function(req, res, next) {
	var db = req.db;
	var user_id = req.user.customData["mongo_id"];
	var collection = db.get('usercollection');
	collection.find({'_id' : user_id}, function (err, user_data) {
        res.json(user_data);
    });

});

router.post('/newelement', stormpath.loginRequired, function(req, res){

	var db = req.db;
	var collection = db.get('usercollection');
	var user_id = req.user.customData["mongo_id"];

	console.log(req.body);

	collection.update(
		{'_id' : user_id},
		{ $push: { budget_elements : req.body} },
		{upsert : true},
		function(err, result){
			res.send(
	            (err === null) ? { msg: '' } : { msg: err }
	        );
	    }
    );
});

router.put('/updateelement/:id', function(req, res){
	var db = req.db;
    var doc = { $set: req.body};
    var userToUpdate = req.params.id;
    db.collection('usercollection').updateById(userToUpdate, doc, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.delete('/deleteelement/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('usercollection').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;

