export { default } from 'should';
import { DataSource } from 'loopback-datasource-juggler';
import * as lib from '../lib/firestore';

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

globalThis.config = config;
globalThis.getDataSource = globalThis.getSchema = customConfig => {
	const db = new DataSource(lib, customConfig || config);

	return db;
};
