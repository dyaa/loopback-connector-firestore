export { default } from 'should';
import { DataSource } from 'loopback-datasource-juggler';
import * as lib from '../lib/tfirestore';

let config;
if (process.env.firestore_projectId != null) {
	config = {
		projectId: process.env.firestore_projectId,
		clientEmail: process.env.firestore_clientEmail,
		privateKey: process.env.firestore_privateKey.replace(/\\n/g, '\n') // eslint-disable-line max-len
	};
}

globalThis.config = config;
globalThis.getDataSource = globalThis.getSchema = function(customConfig) {
	const db = new DataSource(lib, customConfig || config);

	return db;
};
