'use strict';

const db = process.env.MONGO_URI;
const mongoose = require('mongoose');
const options = {
	promiseLibrary: global.Promise
};
let connection = null;

module.exports.connect = () => {
	return new Promise(resolve => {
		//console.log('connection', connection ? connection._readyState : 'null');
		if (!connection || connection._readyState !== 1) {
			mongoose.connect(db, options).then(conn => {
				//console.log(conn);
				if (conn) {
					//console.log('conn', conn.connections[0]._readyState);
					connection = conn.connections[0];
					//console.log('connection2', connection._readyState);
					resolve(connection);
				}
			});
		} else if (connection) {
			resolve(connection);
		}
	});
};