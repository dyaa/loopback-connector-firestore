/*!
 * Module dependencies
 */
// var g = require('strong-globalize')();
var admin = require("firebase-admin");
var path = require('path');
var util = require('util');
var Connector = require('loopback-connector').Connector;
// var debug = require('debug')('loopback:connector:firestore');

exports.initialize = function initializeDataSource(dataSource, callback) {
	dataSource.connector = new Firestore(dataSource.settings);
	process.nextTick(function() {
		callback && callback();
	});
};

exports.Firestore = Firestore;

function Firestore(dataSourceProps) {
	this._models = {};
	this.serviceAccountKey = path.resolve(__dirname, '..', '..', '..', 'server', 'serviceAccountKey.json');

	var serviceAccount = require(this.serviceAccountKey);

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount)
	});

	this.db = admin.firestore();
}

util.inherits(Firestore, Connector);

/**
 * Find matching model instances by the filter
 *
 * @param {String} model The model name
 * @param {Object} filter The filter
 * @param {Function} [callback] The callback function
 */
Firestore.prototype.all = function(model, filter, callback) {
	var data = [];

	if (filter && filter.where && filter.where.id) {
		this.db.collection(model).doc(filter.where.id).get().then(doc => {
			if (!doc.exists) {
				callback(null, {})
			} else {
				var docu = doc.data();
				docu.id = doc.id
				callback(null, [docu])
			}
		})
		.catch(err => callback(err));
	} else { //GET all operation
		this.db.collection(model).get().then(snapshot => {
			snapshot.forEach(doc => {
				var docu = doc.data();
				docu.id = doc.id
				data.push(docu)
			});
		}).then(() => callback(null, data)).catch(err => callback(err));
	}
};

Firestore.prototype.create = function(model, data, callback) {
	this.db.collection(model).add(data).then(ref => callback(null, ref.id)).catch(err => callback(err));
};

Firestore.prototype.exists = function(model, id, options, callback) {
	this.db.collection(model).doc(id).get().then(doc => {
		callback(null, doc.exists)
	})
	.catch(err => callback(err));
};

/**
 * Count the number of instances for the given model
 *
 * @param {String} model The model name
 * @param {Function} [callback] The callback function
 * @param {Object} filter The filter for where
 *
 */
Firestore.prototype.count = function count(model, where, options, callback) {
	if (where.id) {
		this.db.collection(model).doc(where.id).get().then(doc => {
			callback(null, [doc.data()].length)
		})
		.catch(err => callback(err));
	} else {
		this.db.collection(model).get().then(doc => {
			callback(null, doc.length)
		})
		.catch(err => callback(err));
	}
};

Firestore.prototype.ping = function (callback) {
	(this.db.projectId)? callback(null) : callback('Ping Error')
};
