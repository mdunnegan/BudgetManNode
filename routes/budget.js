var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');

router.get('/budget/:username', function(req, res){
  res.render('inside_budget', {
  	username: req.user.username.
  	title: 'im in!' 
  });
});