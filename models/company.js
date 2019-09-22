var mongoose = require('mongoose');
var Comment = require('./comment');
var Review = require('./review');

var companySchema = new mongoose.Schema({
	name: String,
	createdAt: { type: Date, default: Date.now },
	image: String,
	description: String,
	cost: Number,
	location: String,

	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment'
		}
	],
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Review'
		}
	],
	rating: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('Company', companySchema);
