'use strict';
require('dotenv').load();
require('./models/user');
const mongoose = require('mongoose');
const User = mongoose.model('User');
//const User = require('./models/user');
const PrAuthor = require('./models/pr-author');
const github = require('./utils/github');
const mongo = require('./utils/mongo');

const getPaginatedPrData = async url => {
	let data = [];
	const getPage = async n => {
		const newData = await github.GET(`${url}?page=${n}&per_page=100`);
		console.log('oahsdfouan voauh');
		console.log('newData', newData);
		//check here
		data = [...data, ...newData];

		if (Array.isArray(newData) && newData.length > 0) return await getPage(n + 1);
	};
	await getPage(1);
	return data;
};
module.exports.updatePrAuthors = async (event, context, callback) => {
	console.log('called');
	context.callbackWaitsForEmptyEventLoop = false;
	try {
		let response = {
			isBase64Encoded: false,
			statusCode: 200,
			headers: null,
			body: JSON.stringify({ text: 'Done' })
		};
		await mongo.connect();
		const ghData = await getPaginatedPrData('/repos/Dermveda/dermveda-api/commits');
		let prAuthors = [];
		const authors = github.getUniqueAuthors(ghData);
		await PrAuthor.collection.drop();
		let bulk = PrAuthor.collection.initializeOrderedBulkOp();
		authors.forEach((author, i) => {
			bulk
				.find({ githubID: author.githubID })
				.upsert()
				.updateOne(author);
		});
		await bulk.execute();
		callback(null, response);
	} catch (e) {
		console.log('Error', e);
	}
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
			PrAuthor.find()
				.then(results => {
					response.body = JSON.stringify(results);
					callback(null, response);
				})
				.catch(err => {
					console.log('getPrAuthors Error', err);
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
