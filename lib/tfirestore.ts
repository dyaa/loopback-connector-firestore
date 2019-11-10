import admin from 'firebase-admin';
import { Connector } from 'loopback-connector';

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
}

export { Firestore, initialize };
