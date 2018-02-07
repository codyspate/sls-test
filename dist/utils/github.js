'use strict';

const fetch = require('node-fetch');
const githubAPI = 'https://api.github.com';

module.exports.GET = (path, options = {}) => {
	return fetch(`https://api.github.com${path}`, {
		method: 'GET',
		headers: {
			Authorization: `bearer ${process.env.GITHUB_TOKEN}`
		}
	}).then(resp => {
		if (resp.status >= 400) {
			throw new Error('Bad response from server');
		}
		return resp.json();
	});
};

module.exports.getUniqueAuthors = data => {
	//console.log(data);
	if (!Array.isArray(data)) throw new Error('Not an array');
	let prAuthors = [];
	//console.log('LENGTH', data.length);
	data.forEach(({ committer: user }) => {
		if (user) {
			if (!isInArray(prAuthors, user.id)) {
				prAuthors.push({ githubID: user.id, userName: user.login, url: user.url, commitCount: 1 });
			} else {
				//console.log('in this thing');
				const foundAuthor = prAuthors.find(({ githubID }) => githubID == user.id);
				foundAuthor.commitCount++;
			}
		}
	});
	return prAuthors;
};

const isInArray = (arr, searchId) => {
	//console.log('arr', arr);
	return arr.map(({ githubID }) => {
		//console.log('id in map', githubID);
		return githubID;
	}).indexOf(searchId) > -1;
};