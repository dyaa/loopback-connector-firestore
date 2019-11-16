import './init';

let customConfig = null;

try {
	customConfig = require('./config.json');
} catch {
	console.log('Using env config');
}

interface ICustomer {
	id?: string | number;
	name: string;
	emails: string[];
	age: number;
}

const ds = globalThis.getDataSource(customConfig);

describe('Firestore collection', () => {
	const Customer = ds.createModel('customer', {
		name: String,
		emails: [String],
		age: Number
	});

	let customer1: ICustomer, customer2: ICustomer;

	it('Should get all documents in empty collection', done => {
		Customer.all((err, customer: ICustomer) => {
			customer.should.have.length(0);
			done(err);
		});
	});

	it('Should get document in empty collection', done => {
		Customer.find({ where: { id: 1 } }, (err, customer: ICustomer) => {
			customer.should.have.length(0);
			done(err);
		});
	});

	it('Should create a document', done => {
		Customer.create(
			{
				name: 'Dyaa Eldin',
				emails: ['noreply@dyaa.me', 'foo@bar.com'],
				age: 26
			},
			(err, customer: ICustomer) => {
				customer1 = customer;
				customer.should.have.property('name', 'Dyaa Eldin');
				customer.should.have.property('emails').with.lengthOf(2);
				done(err);
			}
		);
	});

	it('Should create another document', done => {
		Customer.create(
			{
				name: 'Cristian Bullokles',
				emails: ['cris@bar.com'],
				age: 27
			},
			(err, customer: ICustomer) => {
				customer2 = customer;
				customer.should.have.property('name', 'Cristian Bullokles');
				customer.should.have.property('emails').with.lengthOf(1);
				done(err);
			}
		);
	});

	it('Should find a document by id', done => {
		Customer.find(
			{ where: { id: customer1.id } },
			(err, customers: ICustomer[]) => {
				customers.should.be.instanceOf(Array);
				customers.should.containDeep([{ id: customer1.id }]);
				done(err);
			}
		);
	});

	it('Should get object properties', done => {
		Customer.find(
			{ where: { id: customer1.id } },
			(err, customers: ICustomer[]) => {
				customers.should.have.length(1);
				customers.should.containDeep([{ name: customer1.name }]);
				customers.should.containDeep([{ id: customer1.id }]);

				done(err);
			}
		);
	});

	it('Should get all documents', done => {
		Customer.all((err, customers: ICustomer[]) => {
			customers.should.have.length(2);
			customers.should.containDeep([{ id: customer1.id }]);
			customers.should.containDeep([{ id: customer2.id }]);
			done(err);
		});
	});

	// it('Should find a documents by age less than 28', done => {
	// 	Customer.find(
	// 		{ where: { age: { lt: 28 } } },
	// 		(err, customers: ICustomer[]) => {
	// 			customers.should.have.length(2);
	// 			customers.should.containDeep([{ age: 26 }]);
	// 			customers.should.containDeep([{ id: customer1.id }]);
	// 			done(err);
	// 		}
	// 	);
	// });

	// it('Should find a document by age equals to 26', done => {
	// 	Customer.find(
	// 		{ where: { age: customer1.age } },
	// 		(err, customers: ICustomer[]) => {
	// 			customers.should.have.length(1);
	// 			customers.should.containDeep([{ age: customer1.age }]);
	// 			customers.should.containDeep([{ id: customer1.id }]);
	// 			done(err);
	// 		}
	// 	);
	// });

	it('Should Replace attributes for a model instance', done => {
		Customer.replaceById(
			customer1.id,
			{ emails: ['bar@example.com'] },
			{ validate: true },
			(err, customer: ICustomer) => {
				customer.should.have.property('emails').with.lengthOf(1);
				done(err);
			}
		);
	});

	it('Should delete a document', done => {
		Customer.destroyAll({ id: customer1.id }, (err, _) => {
			done(err);
		});
	});

	it('Should delete all document', done => {
		Customer.destroyAll(null, (err, customer: ICustomer) => {
			done(err);
		});
	});
});
