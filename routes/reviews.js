var express = require('express');
var router = express.Router({ mergeParams: true });
var Company = require('../models/company');
var Review = require('../models/review');
var middleware = require('../middleware');

router.get('/', function(req, res) {
	Company.findById(req.params.id)
		.populate({
			path: 'reviews',
			options: { sort: { createdAt: -1 } } // sorting the populated reviews array to show the latest first
		})
		.exec(function(err, company) {
			if (err || !company) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			res.render('reviews/index', { company: company });
		});
});

// Reviews New
router.get(
	'/new',
	middleware.isLoggedIn,
	middleware.checkReviewExistence,
	function(req, res) {
		// middleware.checkReviewExistence checks if a user already reviewed the campground, only one review per user is allowed
		Company.findById(req.params.id, function(err, company) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			res.render('reviews/new', { company: company });
		});
	}
);

// Reviews Create
router.post(
	'/',
	middleware.isLoggedIn,
	middleware.checkReviewExistence,
	function(req, res) {
		Company.findById(req.params.id)
			.populate('reviews')
			.exec(function(err, company) {
				if (err) {
					req.flash('error', err.message);
					return res.redirect('back');
				}
				Review.create(req.body.review, function(err, review) {
					if (err) {
						req.flash('error', err.message);
						return res.redirect('back');
					}

					review.author.id = req.user._id;
					review.author.username = req.user.username;
					review.company = company;
					//save review
					review.save();
					company.reviews.push(review);
					// calculate the new average review
					company.rating = calculateAverage(company.reviews);
					//save
					company.save();
					req.flash('success', 'Your review has been successfully added.');
					res.redirect('/companies/' + company._id);
				});
			});
	}
);

// Reviews Edit
router.get('/:review_id/edit', middleware.checkReviewOwnership, function(
	req,
	res
) {
	Review.findById(req.params.review_id, function(err, foundReview) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		res.render('reviews/edit', {
			company_id: req.params.id,
			review: foundReview
		});
	});
});

// Reviews Update
router.put('/:review_id', middleware.checkReviewOwnership, function(req, res) {
	Review.findByIdAndUpdate(
		req.params.review_id,
		req.body.review,
		{ new: true },
		function(err, updatedReview) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			Company.findById(req.params.id)
				.populate('reviews')
				.exec(function(err, company) {
					if (err) {
						req.flash('error', err.message);
						return res.redirect('back');
					}
					// recalculate  average
					company.rating = calculateAverage(company.reviews);
					//save changes
					company.save();
					req.flash('success', 'Your review was successfully edited.');
					res.redirect('/companies/' + company._id);
				});
		}
	);
});

// Reviews Delete
router.delete('/:review_id', middleware.checkReviewOwnership, function(
	req,
	res
) {
	Review.findByIdAndRemove(req.params.review_id, function(err) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		Company.findByIdAndUpdate(
			req.params.id,
			{ $pull: { reviews: req.params.review_id } },
			{ new: true }
		)
			.populate('reviews')
			.exec(function(err, company) {
				if (err) {
					req.flash('error', err.message);
					return res.redirect('back');
				}
				// recalculate  average
				company.rating = calculateAverage(company.reviews);
				//save changes
				company.save();
				req.flash('success', 'Your review was deleted successfully.');
				res.redirect('/companies/' + req.params.id);
			});
	});
});

function calculateAverage(reviews) {
	if (reviews.length === 0) {
		return 0;
	}
	var sum = 0;
	reviews.forEach(function(element) {
		sum += element.rating;
	});
	return sum / reviews.length;
}

module.exports = router;
