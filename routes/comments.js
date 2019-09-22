var express = require('express');
var router = express.Router({ mergeParams: true });
var Company = require('../models/company');
var Comment = require('../models/comment');
var middleware = require('../middleware');

router.get('/new', middleware.isLoggedIn, function(req, res) {
	console.log(req.params.id);
	Company.findById(req.params.id, function(err, company) {
		if (err) {
			console.log(err);
		} else {
			res.render('comments/new', { company: company });
		}
	});
});

router.post('/', middleware.isLoggedIn, function(req, res) {
	Company.findById(req.params.id, function(err, company) {
		if (err) {
			console.log(err);
			res.redirect('/companies');
		} else {
			Comment.create(req.body.comment, function(err, comment) {
				if (err) {
					req.flash('error', 'Something went wrong');
					console.log(err);
				} else {
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					company.comments.push(comment);
					company.save();
					console.log(comment);
					req.flash('success', 'Successfully added comment');
					res.redirect('/companies/' + company._id);
				}
			});
		}
	});
});

router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(
	req,
	res
) {
	Comment.findById(req.params.comment_id, function(err, foundComment) {
		if (err) {
			res.redirect('back');
		} else {
			res.render('comments/edit', {
				company_id: req.params.id,
				comment: foundComment
			});
		}
	});
});

router.put('/:comment_id', middleware.checkCommentOwnership, function(
	req,
	res
) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
		err,
		updatedComment
	) {
		if (err) {
			res.redirect('back');
		} else {
			res.redirect('/companies/' + req.params.id);
		}
	});
});

router.delete('/:comment_id', middleware.checkCommentOwnership, function(
	req,
	res
) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err) {
		if (err) {
			res.redirect('back');
		} else {
			req.flash('success', 'Comment deleted');
			res.redirect('/companies/' + req.params.id);
		}
	});
});

module.exports = router;
