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


router.put('/updateelement/:id', stormpath.loginRequired, function(req, res){

	// in this method, :id will represent the position of the to-be-edited element in the users array of elements

	var db = req.db;
	var collection = db.get('usercollection');
	var user_id = req.user.customData["mongo_id"];
	var budgetElementPosition = req.params.id;

	collection.find({'_id' : user_id}, function (err, user_data) {
        if (err){ throw err;}

        // replace it with req.params.body

		var budget_elements = user_data[0].budget_elements;

		budget_elements[budgetElementPosition] = req.body;

		// console.log(budget_elements);
		// console.log(req.body);

		collection.update(
			{ '_id': user_id }, 
			{"$set" : 
				{"budget_elements" : budget_elements}
			},
			function(err, result){
				res.send(
		            (err === null) ? { msg: '' } : { msg: err }
		        );
		    }
		);
    });
});


router.delete('/deleteelement/:id', stormpath.loginRequired, function(req, res) {

	// id represents the element's position inside the array

	var db = req.db;
	var collection = db.get('usercollection');

	var user_id = req.user.customData["mongo_id"];
	var budgetElementPosition = req.params.id ;
	
	collection.find({'_id' : user_id}, function (err, user_data) {
        if (err){ throw err;}

		var budget_elements = user_data[0].budget_elements;
		budget_elements.splice(budgetElementPosition, 1);

		collection.update(
			{ '_id': user_id }, 
			{"$set" : 
				{"budget_elements" : budget_elements}
			},
			function(err, result){
				res.send(
		            (err === null) ? { msg: '' } : { msg: err }
		        );
		    }
		);
    });
});

module.exports = router;
