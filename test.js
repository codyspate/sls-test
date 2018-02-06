require('dotenv').load();
const fetch = require('node-fetch');
const path = '/repos/Dermveda/dermveda-frontend/pulls';
fetch(`https://api.github.com${path}`, {
	method: 'GET',
	headers: {
		Authorization: `token ${process.env.GITHUB_TOKEN}`
	}
})
	.then(resp => {
		if (resp.status >= 400) {
			console.log('Bad response from server');
		}
		return resp.json();
	})
	.then(data => {
		console.log(data);
	});
