const fetch = require('node-fetch');
const githubAPI = 'https://api.github.com';

module.exports.GET = (path, options = {}) => {
	return new Promise((resolve, reject) => {
		fetch(`https://api.github.com${path}`, {
			method: 'GET',
			headers: {
				Authorization: `bearer ${process.env.GITHUB_TOKEN}`
			}
		})
			.then(resp => {
				if (resp.status >= 400) {
					reject('Bad response from server');
				}
				return resp.json();
			})
			.then(data => {
				resolve(data);
			});
	});
};

module.exports.getUniqueAuthors = data => {
	console.log(data);
	if (!Array.isArray(data)) reject();
	let prAuthors = [];
	console.log('LENGTH', data.length);
	data.forEach(({ user }) => {
		if (!isInArray(prAuthors, user.id)) prAuthors.push({ githubID: user.id, userName: user.login, url: user.url, prCount: 1 });
		else {
			console.log('in this thing');
			const foundAuthor = prAuthors.find(({ githubID }) => githubID == user.id);
			foundAuthor.prCount++;
		}
	});
	return prAuthors;
};

const isInArray = (arr, id) => {
	return arr.map(({ id }) => id).indexOf(id) > -1;
};
