const admin = require('firebase-admin');
const util = require('util');
const Connector = require('loopback-connector').Connector;

exports.initialize = function initializeDataSource(dataSource, callback) {
	dataSource.connector = new Firestore(dataSource.settings);
	process.nextTick(() => {
		callback();
	});
};

class Firestore {
	constructor(dataSourceProps) {
		this._models = {};

		admin.initializeApp({
			credential: admin.credential.cert({
				projectId: dataSourceProps.projectId,
				clientEmail: dataSourceProps.clientEmail,
				privateKey: dataSourceProps.privateKey.replace(/\\n/g, '\n')
			}),
			databaseURL:
				`https://${dataSourceProps.databaseName}` ||
				`${dataSourceProps.projectId}.firebaseio.com`
		});
		this.db = admin.firestore();
		// this.db.settings({timestampsInSnapshots: true});
	}

	/**
	 * Find matching model instances by the filter
	 *
	 * @param {String} model The model name
	 * @param {Object} filter The filter
	 * @param {Function} [callback] The callback function
	 */
	all(model, filter, callback) {
		const response = [];
		const query1 = this.db.collection(model);

		this.buildQuery(filter, query1, query => {
			query
				.get()
				.then(snapshot => {
					if (snapshot.exists) {
						const completeItem = snapshot.data();
						completeItem.id = snapshot.id;
						response.push(completeItem);
					} else if (!snapshot.isEmpty) {
						snapshot.forEach(item => {
							const completeItem = item.data();
							completeItem.id = item.id;
							response.push(completeItem);
						});
					}
				})
				.then(() => callback(null, response))
				.catch(err => callback(err));
		});
	}

	create(model, data, callback) {
		this.db
			.collection(model)
			.add(data)
			.then(function(ref) {
				callback(null, ref.id);
			})
			.catch(function(err) {
				callback(err);
			});
	}

	/**
	 * Update all matching instances
	 * @param {String} model The model name
	 * @param {Object} where The search criteria
	 * @param {Object} data The property/value pairs to be updated
	 * @callback {Function} callback Callback function
	 */
	update(model, where, data, options, callback) {
		const self = this;
		this.exists(model, where.id, null, (err, res) => {
			if (err) callback(err);
			if (res) {
				self.db
					.collection(model)
					.doc(where.id)
					.update(data)
					.then(() => {
						// Document updated successfully.
						callback(null, []);
					});
			} else {
				callback('Document not found');
			}
		});
	}

	updateAll(model, where, data, options, callback) {
		const self = this;
		this.exists(model, where.id, null, (err, res) => {
			if (err) callback(err);
			if (res) {
				self.db
					.collection(model)
					.doc(where.id)
					.update(data)
					.then(() => {
						// Document updated successfully.
						callback(null, []);
					});
			} else {
				callback('Document not found');
			}
		});
	}

	/**
	 * Replace properties for the model instance data
	 * @param {String} model The name of the model
	 * @param {*} id The instance id
	 * @param {Object} data The model data
	 * @param {Object} options The options object
	 * @param {Function} [callback] The callback function
	 */
	replaceById(model, id, data, options, callback) {
		const self = this;
		this.exists(model, id, null, (err, res) => {
			if (err) callback(err);
			if (res) {
				self.db
					.collection(model)
					.doc(id)
					.update(data)
					.then(() => {
						// Document updated successfully.
						callback(null, []);
					});
			} else {
				callback('Document not found');
			}
		});
	}

	/**
	 * Update properties for the model instance data
	 * @param {String} model The model name
	 * @param {*} id The instance id
	 * @param {Object} data The model data
	 * @param {Function} [callback] The callback function
	 */
	updateAttributes(model, id, data, options, callback) {
		const self = this;
		this.exists(model, id, null, (err, res) => {
			if (err) callback(err);
			if (res) {
				self.db
					.collection(model)
					.doc(id)
					.set(data)
					.then(() => {
						// Document updated successfully.
						callback(null, []);
					});
			} else {
				callback('Document not found');
			}
		});
	}

	/**
	 * Delete a model instance by id
	 * @param {String} model The model name
	 * @param {*} id The instance id
	 * @param [callback] The callback function
	 */
	destroyById(model, id, callback) {
		const self = this;
		this.exists(model, id, null, (err, res) => {
			if (err) callback(err);
			if (res) {
				self.db
					.collection(model)
					.doc(id)
					.delete()
					.then(() => {
						// Document deleted successfully.
						callback(null, []);
					});
			} else {
				callback('Document not found');
			}
		});
	}

	/**
	 * Delete a model instance
	 * @param {String} model The model name
	 * @param {Object} where The id Object
	 * @param [callback] The callback function
	 */
	destroyAll(model, where, callback) {
		const self = this;

		if (where.id) {
			this.exists(model, where.id, null, (err, res) => {
				if (err) callback(err);
				if (res) {
					self.db
						.collection(model)
						.doc(where.id)
						.delete()
						.then(() => {
							// Document deleted successfully.
							callback(null, []);
						});
				} else {
					callback('Document not found');
				}
			});
		} else {
			this.deleteCollection(this.db, model, 10)
				.then(() => {
					callback(null, '');
				})
				.catch(err => callback(err));
		}
	}

	deleteQueryBatch(db, query, batchSize, resolve, reject) {
		query
			.get()
			.then(snapshot => {
				// When there are no documents left, we are done
				if (snapshot.size == 0) {
					return 0;
				}

				// Delete documents in a batch
				const batch = db.batch();
				snapshot.docs.forEach(doc => batch.delete(doc.ref));

				return batch.commit().then(() => snapshot.size);
			})
			.then(numDeleted => {
				if (numDeleted === 0) {
					resolve();
					return;
				}

				// Recurse on the next process tick, to avoid
				// exploding the stack.
				process.nextTick(() => {
					this.deleteQueryBatch(db, query, batchSize, resolve, reject);
				});
			})
			.catch(reject);
	}

	deleteCollection(db, collectionPath, batchSize) {
		const collectionRef = db.collection(collectionPath);
		const query = collectionRef.orderBy('__name__').limit(batchSize);

		return new Promise((resolve, reject) => {
			this.deleteQueryBatch(db, query, batchSize, resolve, reject);
		});
	}

	/**
	 * Check if a model instance exists by id
	 * @param {String} model The model name
	 * @param {*} id The id value
	 * @param {Function} [callback] The callback function
	 *
	 */
	exists(model, id, options, callback) {
		this.db
			.collection(model)
			.doc(id)
			.get()
			.then(doc => {
				callback(null, doc.exists);
			})
			.catch(err => callback(err));
	}

	/**
	 * Count the number of instances for the given model
	 *
	 * @param {String} model The model name
	 * @param {Object} where The id Object
	 * @param {Function} [callback] The callback function
	 *
	 */
	count(model, where, options, callback) {
		if (Object.keys(where).length > 0) {
			this.db
				.collection(model)
				.where(Object.keys(where)[0], '==', Object.values(where)[0])
				.get()
				.then(doc => {
					callback(null, doc.docs.length);
				})
				.catch(err => callback(err));
		} else {
			this.db
				.collection(model)
				.get()
				.then(doc => {
					callback(null, doc.docs.length);
				})
				.catch(err => callback(err));
		}
	}

	ping(callback) {
		if (this.db.projectId) {
			callback(null);
		} else {
			callback('Ping Error');
		}
	}

	buildQuery(filter, query, callback) {
		const response = query;
		if (filter.where && filter.where.id) {
			callback(query.doc(filter.where.id));
		} else if (filter.where) {
			this.buildWhereQuery(filter.where, query, newQuery => {
				callback(newQuery);
			});
		} else {
			callback(response);
		}
	}

	buildWhereQuery(filter, query, callback) {
		const properties = Object.keys(filter);
		let operator = '==';
		let operand;

		if (typeof filter[properties] == 'object') {
			const restOperator = Object.keys(filter[properties]);
			operator = this.decodeOperator(restOperator);
			operand = filter[properties][restOperator];
		} else if (typeof filter[properties[0]].inq === 'object') {
			operand = filter[properties[0]].inq[0];
		} else {
			operand = filter[properties[0]];
		}
		callback(query.where(properties[0], operator, operand));
	}

	decodeOperator(restOperator) {
		let operator = '==';
		if (restOperator == 'lt') {
			operator = '<';
		} else if (restOperator == 'gt') {
			operator = '>';
		}
		return operator;
	}

	getCollectionDocuments(snapshot) {
		const data = [];
		if (snapshot.exists == true) {
			const docu = snapshot.data;
			docu.id = snapshot.id;
			data.push(docu);
		} else {
			snapshot.forEach(doc => {
				data.push(doc);
			});
		}
	}
}

util.inherits(Firestore, Connector);
exports.Firestore = Firestore;
