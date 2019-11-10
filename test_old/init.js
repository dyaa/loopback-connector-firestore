module.exports = require("should");

const DataSource = require("loopback-datasource-juggler").DataSource;

let config;
if (process.env.firestore_projectId != null) {
	config = {
		projectId: process.env.firestore_projectId,
		clientEmail: process.env.firestore_clientEmail,
		privateKey: process.env.firestore_privateKey.replace(/\\n/g, "\n") // eslint-disable-line max-len
	};
}

global.config = config;

global.getDataSource = global.getSchema = function(customConfig) {
	const db = new DataSource(require(".."), customConfig || config);
	db.log = function(a) {
		console.log(a);
	};

	return db;
};
