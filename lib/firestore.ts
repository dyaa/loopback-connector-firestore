import admin, { FirebaseError } from 'firebase-admin';
import { Connector } from 'loopback-connector';
import { QuerySnapshot } from '@google-cloud/firestore';

const initialize = function initializeDataSource(dataSource, callback) {
	dataSource.connector = new Firestore(dataSource.settings);
	process.nextTick(() => {
		callback();
	});
};

class Firestore extends Connector {
	public _models: any;
	public db: any;

	constructor(dataSourceProps) {
		super();
		this._models = {};

		const {
			projectId,
			clientEmail,
			privateKey,
			databaseName
		} = dataSourceProps;
		const databaseURL =
			`https://${databaseName}` || `${projectId}.firebaseio.com`;

		admin.initializeApp({
			credential: admin.credential.cert({
				projectId,
				clientEmail,
				privateKey: privateKey.replace(/\\n/g, '\n')
			}),
			databaseURL
		});

		this.db = admin.firestore();
	}

	/**
	 * Find matching model instances by the filter
	 *
	 * @param {String} model The model name
	 * @param {Object} filter The filter
	 * @param {Function} [callback] The callback function
	 */
	public all = (model: string, filter: any, callback: any) => {
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
	};

	/**
	 * Check if a model instance exists by id
	 * @param {String} model The model name
	 * @param {*} id The id value
	 * @param {Function} [callback] The callback function
	 *
	 */
	public exists = (
		model: string,
		id: number | string,
		_options,
		callback: any
	) => {
		this.db
			.collection(model)
			.doc(id)
			.get()
			.then(doc => {
				callback(null, doc.exists);
			})
			.catch(err => callback(err));
	};

	/**
	 * Count the number of instances for the given model
	 *
	 * @param {String} model The model name
	 * @param {Object} where The id Object
	 * @param {Function} [callback] The callback function
	 *
	 */
	public count = (model: string, where: any, _options: any, callback: any) => {
		if (Object.keys(where).length > 0) {
			this.db
				.collection(model)
				.where(Object.keys(where)[0], '==', Object.values(where)[0])
				.get()
				.then((doc: QuerySnapshot) => {
					callback(null, doc.docs.length);
				})
				.catch((err: FirebaseError) => callback(err));
		} else {
			this.db
				.collection(model)
				.get()
				.then(doc => {
					callback(null, doc.docs.length);
				})
				.catch(err => callback(err));
		}
	};

	public ping = (callback: any) => {
		if (this.db.projectId) {
			callback(null);
		} else {
			callback('Ping Error');
		}
	};

	/**
	 * Update all matching instances
	 * @param {String} model The model name
	 * @param {Object} where The search criteria
	 * @param {Object} data The property/value pairs to be updated
	 * @callback {Function} callback Callback function
	 */
	public update = (model, where, data, _options, callback) => {
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
	};

	/**
	 * Replace properties for the model instance data
	 * @param {String} model The name of the model
	 * @param {*} id The instance id
	 * @param {Object} data The model data
	 * @param {Object} options The options object
	 * @param {Function} [callback] The callback function
	 */
	public replaceById = (model, id, data, _options, callback) => {
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
	};

	/**
	 * Update properties for the model instance data
	 * @param {String} model The model name
	 * @param {*} id The instance id
	 * @param {Object} data The model data
	 * @param {Function} [callback] The callback function
	 */
	public updateAttributes = (model, id, data, _options, callback) => {
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
	};

	/**
	 * Delete a model instance by id
	 * @param {String} model The model name
	 * @param {*} id The instance id
	 * @param [callback] The callback function
	 */
	public destroyById = (model, id, callback) => {
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
	};

	/**
	 * Delete a model instance
	 * @param {String} model The model name
	 * @param {Object} where The id Object
	 * @param [callback] The callback function
	 */
	public destroyAll = (model, where, callback) => {
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
	};

	public deleteQueryBatch = (db, query, batchSize, resolve, reject) => {
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
	};

	public create = (model, data, callback) => {
		this.db
			.collection(model)
			.add(data)
			.then(function(ref) {
				callback(null, ref.id);
			})
			.catch(function(err) {
				callback(err);
			});
	};

	public updateAll = (model, where, data, _options, callback) => {
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
	};

	private deleteCollection = (db, collectionPath, batchSize) => {
		const collectionRef = db.collection(collectionPath);
		const query = collectionRef.orderBy('__name__').limit(batchSize);

		return new Promise((resolve, reject) => {
			this.deleteQueryBatch(db, query, batchSize, resolve, reject);
		});
	};

	private buildQuery = (filter: any, query: any, callback: any) => {
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
	};

	private buildWhereQuery = (
		filter: { [x: string]: any },
		query: any,
		callback: (arg0: any) => void
	) => {
		const properties = Object.keys(filter).toString();
		let operator = '==';
		let operand;

		if (typeof filter[properties] === 'object') {
			const restOperator = Object.keys(filter[properties]).toString();
			operator = this.decodeOperator(restOperator);
			operand = filter[properties][restOperator];
		} else if (typeof filter[properties[0]].inq === 'object') {
			operand = filter[properties[0]].inq[0];
		} else {
			operand = filter[properties[0]];
		}
		callback(query.where(properties[0], operator, operand));
	};

	private decodeOperator = (restOperator: string) => {
		let operator = '==';
		if (restOperator == 'lt') {
			operator = '<';
		} else if (restOperator == 'gt') {
			operator = '>';
		}
		return operator;
	};
}

export { Firestore, initialize };
