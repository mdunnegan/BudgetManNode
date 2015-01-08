var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stormpath = require('express-stormpath');

// Mongo
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var monk = require('monk');
var db = monk('localhost:27017/NodeBudgetMan');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var mongo_key_size = 24;

// stormpath setup: https://stormpath.com/blog/making-expressjs-authentication-fun-again/
app.use(stormpath.init(app, {

    postRegistrationHandler: function(account, res, next) {

    	// Upon registering, a user is given a random mongo id. Mongo will hold all the users budgets
        var collection = db.get('usercollection');
        var mongo_id = new ObjectID();
        collection.insert( { _id: mongo_id, budget_elements: [] } );
        account.customData["mongo_id"] = mongo_id;

        account.customData.save(function(err) {
            if (err) {
                console.log('DID NOT SAVE USER');
                next(err);
            } else {
                console.log('custom data saved!');
            }
        });
    
        console.log('User:\n', account, '\njust registered!');
        next();
    },

    apiKeyId: '~/.stormpath.apiKey.properties',
    // apiKeySecret: 'xxx',
    application: 'https://api.stormpath.com/v1/applications/1MuAnxS8O7eDluYUzrsA6H',
    secretKey: 'secret_key_is_difficult_to_guess_and_shouldnt_go_in_sourcecode',
    redirectUrl: '/dashboard',
    enableAutoLogin: true,
    expandCustomData: true // lets me save custom data
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make mongoDB accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
