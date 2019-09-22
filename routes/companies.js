var express = require('express');
var router = express.Router();
var Company = require('../models/company');
var middleware = require('../middleware');
var Review = require('../models/review');
var Comment = require('../models/comment');

router.get('/', function(req, res) {
	Company.find({}, function(err, allCompanies) {
		if (err) {
			console.log(err);
		} else {
			res.render('companies/index', { companies: allCompanies });
		}
	});
});

router.post('/', middleware.isLoggedIn, function(req, res) {
	var name = req.body.name;
	var image = req.body.image;
	var cost = req.body.cost;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};

	var newCompany = {
		name: name,
		image: image,
		cost: cost,
		description: desc,
		author: author
	};

	Company.create(newCompany, function(err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			console.log(newlyCreated);
			res.redirect('/companies');
		}
	});
});

router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('companies/new');
});

router.get('/:id', function(req, res) {
	Company.findById(req.params.id)
		.populate('comments')
		.populate({
			path: 'reviews',
			options: { sort: { createdAt: -1 } }
		})
		.exec(function(err, foundCompany) {
			if (err) {
				console.log(err);
			} else {
				res.render('companies/show', { company: foundCompany });
			}
		});
});

router.get('/:id/edit', middleware.checkCompanyOwnership, function(req, res) {
	Company.findById(req.params.id, function(err, foundCompany) {
		res.render('companies/edit', { company: foundCompany });
	});
});

router.put('/:id', middleware.checkCompanyOwnership, function(req, res) {
	Company.findByIdAndUpdate(req.params.id, req.body.company, function(
		err,
		company
	) {
		if (err) {
			req.flash('error', err.message);
			res.redirect('back');
		} else {
			req.flash('success', 'Successfully Updated!');
			res.redirect('/companies/' + company._id);
		}
	});
});

router.delete('/:id', middleware.checkCompanyOwnership, function(req, res) {
	Company.findById(req.params.id, function(err, company) {
		if (err) {
			res.redirect('/companies');
		} else {
			Comment.remove({ _id: { $in: company.comments } }, function(err) {
				if (err) {
					console.log(err);
					return res.redirect('/companies');
				}

				Review.remove({ _id: { $in: company.reviews } }, function(err) {
					if (err) {
						console.log(err);
						return res.redirect('/companies');
					}

					company.remove();
					req.flash('success', 'company deleted successfully!');
					res.redirect('/companies');
				});
			});
		}
	});
});

module.exports = router;
