require('./init.js');

let customConfig = null;

try {
	customConfig = require('./config.json');
} catch (error) {
	console.log('Using env config');
}

// eslint-disable-next-line no-undef
const ds = getDataSource(customConfig);

describe('Firestore collection', () => {
	const Customer = ds.createModel('customer', {
		name: String,
		emails: [String],
		age: Number
	});

	let customer1, customer2;

	it('Should get all documents in empty collection', done => {
		Customer.all((err, customers) => {
			customers.should.have.length(0);
			done(err);
		});
	});

	it('Should get document in empty collection', done => {
		Customer.find({ where: { id: 1 } }, (err, customers) => {
			customers.should.have.length(0);
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
			(err, customer) => {
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
			(err, customer) => {
				customer2 = customer;
				customer.should.have.property('name', 'Cristian Bullokles');
				customer.should.have.property('emails').with.lengthOf(1);
				done(err);
			}
		);
	});

	it('Should find a document by id', done => {
		Customer.find({ where: { id: customer1.id } }, (err, customers) => {
			customers.should.be.instanceOf(Array);
			customers.should.containDeep([{ id: customer1.id }]);
			done(err);
		});
	});

	it('Should get object properties', done => {
		Customer.find({ where: { id: customer1.id } }, (err, customers) => {
			customers.should.have.length(1);
			customers.should.containDeep([{ name: customer1.name }]);
			customers.should.containDeep([{ id: customer1.id }]);

			done(err);
		});
	});

	it('Should get all documents', done => {
		Customer.all((err, customers) => {
			customers.should.have.length(2);
			customers.should.containDeep([{ id: customer1.id }]);
			customers.should.containDeep([{ id: customer2.id }]);
			done(err);
		});
	});

	it('Should find a documents by age less than 28', done => {
		Customer.find({ where: { age: { lt: 28 } } }, (err, customers) => {
			customers.should.have.length(2);
			customers.should.containDeep([{ age: 26 }]);
			customers.should.containDeep([{ id: customer1.id }]);
			done(err);
		});
	});

	it('Should find a document by age equals to 26', done => {
		Customer.find({ where: { age: customer1.age } }, (err, customers) => {
			customers.should.have.length(1);
			customers.should.containDeep([{ age: customer1.age }]);
			customers.should.containDeep([{ id: customer1.id }]);
			done(err);
		});
	});

	it('Should get one document from all using limit filter', done => {
		Customer.all({ limit: 1 }, (err, customers) => {
			customers.should.have.length(1);
			customers.should.containDeep([{ id: customer1.id }]);

			done(err);
		});
	});

	it('Should get Cristian as first Document in the array', done => {
		Customer.all({ order: 'age desc' }, (err, customers) => {
			customers.should.have.length(2);
			customers[0].should.containDeep({ id: customer2.id });

			done(err);
		});
	});

	it('Should Replace attributes for a model instance', done => {
		Customer.replaceById(
			customer1.id,
			{ emails: ['bar@example.com'] },
			{ validate: true },
			(err, customer) => {
				customer.should.have.property('emails').with.lengthOf(1);
				done(err);
			}
		);
	});

	it('Should delete a document', done => {
		Customer.destroyAll({ id: customer1.id }, err => {
			done(err);
		});
	});

	it('Should delete all document', done => {
		Customer.destroyAll(null, err => {
			done(err);
		});
	});
});
