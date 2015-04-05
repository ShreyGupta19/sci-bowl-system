//Initialization variables for all dependencies.
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var db = require("./db.js");

//Sets up templating engine for establishing directory structure
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({secret: '1234567890QWERTY', resave: false, saveUninitialized: false}));
app.use(express.static(__dirname + '/public'));
db.initializeMongo(function (err) {
	if (err) throw err;
	console.log("Successfully connected to MongoDB.");
	var loginpage = require('./views/loginpage.js');
	var setup = require('./views/setup.js');
	var quiz = require('./views/quiz.js');
	app.get('/', loginpage.get);
	app.post('/', loginpage.post);
	app.get('/setup', setup.get);
	app.post('/setup', setup.post);
	app.get('/quiz', quiz.get);
	app.post('/quiz', quiz.post);

	http.listen(app.get('port'), function(){
		console.log('listening on:' + app.get('port'));
	});
});
