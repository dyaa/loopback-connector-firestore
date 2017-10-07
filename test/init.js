'use strict';

module.exports = require('should');

var DataSource = require('loopback-datasource-juggler').DataSource;

var config = {
	projectId: '',
	clientEmail: '',
	privateKey: '', // eslint-disable-line max-len
	databaseName: '',
};

global.config = config;

global.getDataSource = global.getSchema = function(customConfig) {
	var db = new DataSource(require('../'), customConfig || config);
	db.log = function(a) {
		console.log(a);
	};

	return db;
};
