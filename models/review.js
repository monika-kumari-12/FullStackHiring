var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema(
	{
		rating: {
			type: Number,

			required: 'Please provide a rating (1-5 stars).',
			// Defining min and max values
			min: 1,
			max: 5,
			// Adding validation to check if the input is an integer
			validate: {
				validator: Number.isInteger,
				message: '{VALUE} is not an integer value.'
			}
		},

		text: {
			type: String
		},

		author: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			username: String
		},

		company: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Company'
		}
	},
	{
		// if timestamps are set to true, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
		timestamps: true
	}
);

module.exports = mongoose.model('Review', reviewSchema);
