'use strict';

const mongoose = require('mongoose');

const PrAuthor = mongoose.model('PrAuthor', {
	githubID: {
		type: Number,
		required: true
	},
	userName: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	prCount: {
		type: Number
	}
});

module.exports = PrAuthor;