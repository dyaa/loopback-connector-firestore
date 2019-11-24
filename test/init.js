module.exports = require('should');

const { DataSource } = require('loopback-datasource-juggler');
const lib = require('./../dist/firestore');

const {
	firestore_projectId: projectId,
	firestore_clientEmail: clientEmail,
	firestore_privateKey: privateKey
} = process.env;

let config;

if (projectId) {
	config = {
		projectId,
		clientEmail,
		privateKey: privateKey.replace(/\\n/g, '\n')
	};
}

global.config = config;

global.getDataSource = global.getSchema = customConfig => {
	const db = new DataSource(lib, customConfig || config);

	db.log = a => {
		console.log(a);
	};

	return db;
};
