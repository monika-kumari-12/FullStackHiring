var mongoose = require('mongoose');
var Comment = require('./comment');
var User = require('./user');
var commentSchema = mongoose.Schema({
	text: String,
	createdAt: { type: Date, default: Date.now }, //we have used moment module to show date
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	}
});

module.exports = mongoose.model('Comment', commentSchema);
