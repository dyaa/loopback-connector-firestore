import { Connector } from 'loopback-connector';
import {
	QuerySnapshot,
	Firestore as Admin,
	Query,
	DocumentSnapshot,
	QueryDocumentSnapshot,
	DocumentReference
} from '@google-cloud/firestore';
import { IFilter, IDataSource, ICallback } from './interfaces';
import { operators } from './config';

const initialize = function initializeDataSource(
	dataSource: IDataSource,
	callback: any
) {
	dataSource.connector = new Firestore(dataSource.settings!);
	process.nextTick(() => {
		callback();
	});
};

class Firestore extends Connector {
	public _models: any;
	public db: any;

	constructor(dataSourceProps: IDataSource) {
		super();
		this._models = {};

		const { projectId, clientEmail, privateKey } = dataSourceProps;

		const firestore = new Admin({
			credentials: {
				private_key: privateKey!.replace(/\\n/g, '\n'), // eslint-disable-line camelcase
				client_email: clientEmail // eslint-disable-line camelcase
			},
			projectId
		});

		this.db = firestore;
	}

	/**
	 * Find matching model instances by the filter
	 *
	 * @param {String} model The model name
	 * @param {Object} filter The filter
	 * @param {Function} [callback] The callback function
	 */
	public all = async (
		model: string,
		filter: IFilter,
		_options: any,
		callback: ICallback
	) => {
		const { where } = filter;

		try {
			let result: any[];
			if (where && where.id) {
				const { id } = where;
				result = await this.findById(model, id);
			} else if (this.hasFilter(filter)) {
				result = await this.findFilteredDocuments(model, filter);
			} else {
				result = await this.findAllOfModel(model);
			}

			callback(null, result);
		} catch (error) {
			callback(error);
		}
	};

	/**
	 * Check if a model instance exists by id
	 * @param {String} model The model name
	 * @param {Number | String} id The id value
	 * @param {Function} [callback] The callback function
	 *
	 */
	public exists = (
		model: string,
		id: number | string,
		_options: any,
		callback: ICallback
	) => {
		this.db
			.collection(model)
			.doc(id)
			.get()
			.then((doc: DocumentSnapshot) => {
				callback(null, doc.exists);
			})
			.catch((err: Error) => callback(err));
	};

	/**
	 * Count the number of instances for the given model
	 *
	 * @param {String} model The model name
	 * @param {Object} where The id Object
	 * @param {Function} [callback] The callback function
	 *
	 */
	public count = (
		model: string,
		where: any,
		_options: any,
		callback: ICallback
	) => {
		if (Object.keys(where).length > 0) {
			this.db
				.collection(model)
				.where(Object.keys(where)[0], '==', Object.values(where)[0])
				.get()
				.then((doc: QuerySnapshot) => {
					callback(null, doc.docs.length);
				})
				.catch((err: Error) => callback(err));
		} else {
			this.db
				.collection(model)
				.get()
				.then((doc: QuerySnapshot) => {
					callback(null, doc.docs.length);
				})
				.catch((err: Error) => callback(err));
		}
	};

	public ping = (callback: ICallback) => {
		if (this.db.projectId) {
			callback(null);
		} else {
			callback(new Error('Ping Error'));
		}
	};

	/**
	 * Update all matching instances
	 * @param {String} model The model name
	 * @param {Object} where The search criteria
	 * @param {Object} data The property/value pairs to be updated
	 * @callback {Function} callback Callback function
	 */
	public update = (
		model: string,
		where: any,
		data: any,
		_options: any,
		callback: ICallback
	) => {
		const self = this;
		this.exists(model, where.id, null, (err, res: boolean) => {
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
				callback(new Error('Document not found'));
			}
		});
	};

	/**
	 * Replace properties for the model instance data
	 * @param {String} model The name of the model
	 * @param {String | Number} id The instance id
	 * @param {Object} data The model data
	 * @param {Object} options The options object
	 * @param {Function} [callback] The callback function
	 */
	public replaceById = (
		model: string,
		id: string | number,
		data: any,
		_options: any,
		callback: ICallback
	) => {
		const self = this;
		this.exists(model, id, null, (err, res: boolean) => {
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
				callback(new Error('Document not found'));
			}
		});
	};

	/**
	 * Update properties for the model instance data
	 * @param {String} model The model name
	 * @param {String | Number} id The instance id
	 * @param {Object} data The model data
	 * @param {Function} [callback] The callback function
	 */
	public updateAttributes = (
		model: string,
		id: string | number,
		data: any,
		_options: any,
		callback: ICallback
	) => {
		const self = this;
		this.exists(model, id, null, (err, res: boolean) => {
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
				callback(new Error('Document not found'));
			}
		});
	};

	/**
	 * Delete a model instance by id
	 * @param {String} model The model name
	 * @param {String | Number} id The instance id
	 * @param [callback] The callback function
	 */
	public destroyById = (
		model: string,
		id: string | number,
		callback: ICallback
	) => {
		const self = this;
		this.exists(model, id, null, (err, res: boolean) => {
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
				callback(new Error('Document not found'));
			}
		});
	};

	/**
	 * Delete a model instance
	 * @param {String} model The model name
	 * @param {Object} where The id Object
	 * @param [callback] The callback function
	 */
	public destroyAll = (model: string, where: any, callback: ICallback) => {
		const self = this;

		if (where.id) {
			this.exists(model, where.id, null, (err, res: boolean) => {
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
					callback(new Error('Document not found'));
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

	public deleteQueryBatch = (
		db: Admin,
		query: Query,
		batchSize: number,
		resolve: any,
		reject: any
	) => {
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

	public create = (model: string, data: any, callback: ICallback) => {
		this.db
			.collection(model)
			.add(data)
			.then((ref: DocumentReference) => {
				callback(null, ref.id);
			})
			.catch((err: Error) => {
				callback(err);
			});
	};

	public updateAll = (
		model: string,
		where: any,
		data: any,
		_options: any,
		callback: ICallback
	) => {
		const self = this;
		this.exists(model, where.id, null, (err, res: boolean) => {
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
				callback(new Error('Document not found'));
			}
		});
	};

	/**
	 * Complete the Document objects with their ids
	 * @param {DocumentSnapshot[] | QueryDocumentSnapshot[]} snapshots The array of snapshots
	 */
	private completeDocumentResults = (
		snapshots: DocumentSnapshot[] | QueryDocumentSnapshot[]
	) => {
		const results: any[] = [];

		snapshots.forEach(item =>
			results.push({
				id: item.id,
				...item.data()
			})
		);

		return results;
	};

	/**
	 * Internal method - Check if filter object has at least one valid property
	 * @param {IFilter} filter The filter
	 */
	private hasFilter = ({ where, order, limit, fields, skip }: IFilter) => {
		if (where || limit || fields || order || skip) return true;
		return false;
	};

	/**
	 * Find matching Collection Document by the id
	 * @param {String} model The model name
	 * @param {String} id The Entity id
	 */
	private findById = async (model: string, id: string) => {
		try {
			const documentSnapshot = await this.db
				.collection(model)
				.doc(id)
				.get();
			if (!documentSnapshot.exists) return Promise.resolve([]);

			const result = { id: documentSnapshot.id, ...documentSnapshot.data() };

			return Promise.resolve([result]);
		} catch (error) {
			throw error;
		}
	};

	/**
	 * Find all Documents of a Collection
	 * @param {String} model The model name
	 */
	private findAllOfModel = async (model: string) => {
		try {
			const collectionRef = this.db.collection(model);
			const snapshots = await collectionRef.get();

			if (snapshots.empty || snapshots.size === 0) return Promise.resolve([]);

			const result = this.completeDocumentResults(snapshots.docs);

			return Promise.resolve(result);
		} catch (error) {
			throw error;
		}
	};

	/**
	 * Internal method - Get Documents with query execution
	 * @param {String} model The model name
	 * @param {IFilter} filter The filter
	 */
	private findFilteredDocuments = async (model: string, filter: IFilter) => {
		const query = this.buildNewQuery(model, filter);
		const snapshots = await query.get();

		return this.completeDocumentResults(snapshots);
	};

	/**
	 * Internal method for building query
	 * @param {String} model The model name
	 * @param {IFilter} filter The filter
	 */
	private buildNewQuery = (model: string, filter: IFilter) => {
		const { where, limit, fields, skip } = filter;

		let query = this.db.collection(model);

		if (where) {
			for (const key in where) {
				if (where.hasOwnProperty(key)) {
					const value = { [key]: where[key] };
					query = this.addFiltersToQuery(query, value);
				}
			}
		}

		let { order } = filter;
		if (order) {
			if (!Array.isArray(order)) {
				order = [order];
			}

			for (const option of order) {
				const [property, orderOption] = option.split(' ');
				query = query.orderBy(property, orderOption);
			}
		}

		if (limit) {
			query = query.limit(limit);
		}

		if (skip) {
			query = query.offset(skip);
		}

		if (fields) {
			for (const key in fields) {
				if (fields.hasOwnProperty(key)) {
					const field = fields[key];
					if (field) query = query.select(key);
				}
			}
		}

		return query;
	};

	/**
	 * Add new filter to a Query
	 * @param {Query} query Firestore Query
	 * @param {Object} filter The filter object
	 */
	private addFiltersToQuery = (query: Query, filter: IFilter) => {
		const key = Object.keys(filter)[0];
		const value = Object.values(filter)[0];

		const isObject = typeof value === 'object';

		if (isObject) {
			return this.addInnerFiltersToQuery(query, key, value);
		}

		return query.where(key, '==', value);
	};

	/**
	 * Add inner filters to a Query
	 * @param {Query} query Firestore Query
	 * @param {String} key Property name being filtered
	 * @param {Object} value Object with operator and comparison value
	 */
	private addInnerFiltersToQuery = (query: Query, key: string, value: any) => {
		let resultQuery = query;

		for (const operation in value) {
			if (!value.hasOwnProperty(operation)) {
				continue;
			}
			const comparison = value[operation];
			const operator = operators[operation];
			resultQuery = resultQuery.where(key, operator, comparison);
		}

		return resultQuery;
	};

	private deleteCollection = (
		db: Admin,
		collectionPath: string,
		batchSize: number
	) => {
		const collectionRef = db.collection(collectionPath);
		const query = collectionRef.orderBy('__name__').limit(batchSize);

		return new Promise((resolve, reject) => {
			this.deleteQueryBatch(db, query, batchSize, resolve, reject);
		});
	};
}

export { Firestore, initialize };
