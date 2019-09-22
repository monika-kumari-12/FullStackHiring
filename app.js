var express = require('express');
var app = express();

var bodyParser = require('body-parser'), //for parsing the form data to be used by middleware
	mongoose = require('mongoose'), //to set the schema for mongo data
	passport = require('passport'), //Express-compatible authentication middleware for Node.js
	LocalStrategy = require('passport-local'), //authenticate using username and password
	methodOverride = require('method-override'); //for put and delete in http

///////////////////////////////////////////////////////////////////////////////////////////////

//stuff you do when u use mongoose
var Company = require('./models/company'),
	Comment = require('./models/comment'),
	User = require('./models/user'),
	Review = require('./models/review');

//var port = 3000;
//port number on which server will run

var flash = require('connect-flash'); //https://www.npmjs.com/package/connect-flash
//The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user.

///////////////////////////////////////////////////////////////////////////////////////////////

//requiring routes
var commentRoutes = require('./routes/comments'),
	reviewRoutes = require('./routes/reviews'),
	companyRoutes = require('./routes/companies'),
	indexRoutes = require('./routes/index');

///////////////////////////////////////////////////////////////////////////////////////////////
//connecting mongDB
var DB_URL = process.env.DB_URL || 'mongodb://localhost/inkredo'; //inkredo is the name of database
mongoose.connect(DB_URL, { useNewUrlParser: true });

///////////////////////////////////////////////////////////////////////////////////////////////

//Returns middleware that only parses urlencoded bodies

//The extended option allows to choose between parsing the URL-encoded data with the querystring library (when false) or the qs library (when true).

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); //connecting the templating engine

//To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
app.use(express.static(__dirname + '/public'));

//Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
app.use(methodOverride('_method'));

app.use(flash()); //to use connect-flash middleware

//A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
app.locals.moment = require('moment');

///////////////////////////////////////////////////////////////////////////////////////////////

/// PASSPORT CONFIGURATION
app.use(
	require('express-session')({
		secret: 'monik is the best!!!!!!!!!!!!!!',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

///////////////////////////////////////////////////////////////////////////////////////////////
//Error and Success messages are written to the flash and cleared after being displayed to the user.
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

///////////////////////////////////////////////////////////////////////////////////////////////

//Defining routes

app.use('/', indexRoutes);

app.use('/companies', companyRoutes);
app.use('/companies/:id/comments', commentRoutes);
app.use('/companies/:id/reviews', reviewRoutes);

// Wildcard Routes
app.get('/*', (req, res) => {
	res.send('<h1>INVALID REQUEST</h1>');
});

app.listen(process.env.PORT || 3000);
