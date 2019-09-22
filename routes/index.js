var express = require('express');
var request = require('request');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Company = require('../models/company');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

router.get('/', function(req, res) {
	res.render('landing');
});

router.get('/register', function(req, res) {
	res.render('register', { page: 'register' });
});

router.post('/register', function(req, res) {
	var newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar
	});

	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
			console.log(err);
			return res.render('register', { error: err.message });
		}
		passport.authenticate('local')(req, res, function() {
			req.flash(
				'success',
				'Successfully Signed Up! Hey there! ' + req.body.username
			);
			res.redirect('/companies');
		});
	});
});

//show login form
router.get('/login', function(req, res) {
	res.render('login', { page: 'login' });
});

// handling login logic
router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/companies',
		failureRedirect: '/login',
		failureFlash: 'Username or password do not match',
		successFlash: 'Welcome to INKREDO!'
	}),
	function(req, res) {}
);

// logout route
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Sorry to see you go!');
	res.redirect('/companies');
});

// USER PROFILE
router.get('/users/:id', function(req, res) {
	User.findById(req.params.id, function(err, foundUser) {
		if (err) {
			req.flash('error', 'Something went wrong.');
			res.redirect('/');
		}
		Company.find()
			.where('author.id')
			.equals(foundUser._id)
			.exec(function(err, companies) {
				if (err) {
					req.flash('error', 'Something went wrong.');
					res.redirect('/');
				}
				res.render('users/show', { user: foundUser, companies: companies });
			});
	});
});

module.exports = router;
