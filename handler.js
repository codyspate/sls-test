'use strict';
require('dotenv').load();
const mongoose = require('mongoose');
const User = require('./models/user');
const PrAuthor = require('./models/pr-author');
const github = require('./utils/github');
const mongo = require('./utils/mongo');

module.exports.updatePrAuthors = (event, context, callback) => {
	context.callbackWaitsForEmptyEventLoop = false;
	let response = {
		isBase64Encoded: false,
		statusCode: 200,
		headers: null,
		body: JSON.stringify({ text: 'that shit ran bro!' })
	};
	mongo.connect().then(() => {
		const ghPromise = github.GET('/repos/Dermveda/dermveda-frontend/pulls?state=all');
		let prAuthors = [];
		ghPromise.then(data => {
			const authors = github.getUniqueAuthors(data);
			let bulk = PrAuthor.collection.initializeOrderedBulkOp();
			authors.forEach((author, i) => {
				bulk
					.find({ githubID: author.githubID })
					.upsert()
					.updateOne(author);
			});
			bulk
				.execute()
				.then(() => {
					callback(null, response);
				})
				.catch(err => {
					console.log('Error', err);
				});
		});
	});
};

module.exports.getPrAuthors = (event, context, callback) => {
	context.callbackWaitsForEmptyEventLoop = false;
	let response = {
		isBase64Encoded: false,
		statusCode: 200,
		headers: null,
		body: null
	};
	mongo
		.connect()
		.then(() => {
			PrAuthor.find().then(results => {
				response.body = JSON.stringify(results);
				callback(null, response);
			});
		})
		.catch(() => {
			callback(null, response);
		});
};

module.exports.getUser = (event, context, callback) => {
	context.callbackWaitsForEmptyEventLoop = false;
	let response = {
		isBase64Encoded: false,
		statusCode: 200,
		headers: null,
		body: null
	};
	const email = event.pathParameters.email;
	const promise = mongo.connect();
	promise
		.then(() => {
			User.findOne({ email: email }).then(results => {
				response.body = JSON.stringify({ user: results });
				//context.succeed(response) old way of exiting early
				callback(null, response);
			});
		})
		.catch(err => {
			callback(err);
		});
};

module.exports.setUser = (event, context, callback) => {
	context.callbackWaitsForEmptyEventLoop = false;
	let response = {
		isBase64Encoded: false,
		statusCode: 200,
		headers: null,
		body: null
	};
	let data = JSON.parse(event.body) || {};
	const promise = mongo.connect();
	promise
		.then(() => {
			let user = new User({
				email: data.email,
				favoriteColor: data.favoriteColor
			});
			return user.save();
		})
		.then(() => {
			response.body = JSON.stringify({ message: 'saved' });
			callback(null, response);
		})
		.catch(error => {
			callback(error);
		});
};

module.exports.hello = (event, context, callback) => {
	const response = {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Go Serverless v1.0! Your function executed successfully!',
			input: event
		})
	};

	callback(null, response);

	// Use this code if you don't use the http event with the LAMBDA-PROXY integration
	// callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
