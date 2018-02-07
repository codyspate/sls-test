'use strict';

const mongoose = require('mongoose');

const User = mongoose.model('User', {
	email: {
		type: String,
		required: true
	},
	favoriteColor: {
		type: String
	}
});