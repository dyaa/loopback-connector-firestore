
require('./init.js');
var customConfig = null;
try {
	customConfig = require('./config.json');
} catch (error) {
	console.log('Using env config');
}

var ds = getDataSource(customConfig); // eslint-disable-line no-undef

describe('Firestore collection', function() {
	var Customer = ds.createModel('customer', {
		name: String,
		emails: [String],
		age: Number,
	});

	var customer1, customer2;

	it('Should get all documents in empty collection', function(done) {
		Customer.all(function(err, customer) {
			customer.should.have.length(0);
			done(err, customer);
		});
	});

	it('Should get document in empty collection', function(done) {
		Customer.find({where: {id: 1}}, function(err, customer) {
			customer.should.have.length(0);
			done(err, customer);
		});
	});

	it('Should create a document', function(done) {
		Customer.create({
			name: 'Dyaa Eldin',
			emails: [
				'noreply@dyaa.me', 'foo@bar.com',
			],
			age: 26,
		}, function(err, customer) {
			customer1 = customer;
			customer.should.have.property('name', 'Dyaa Eldin');
			customer.should.have.property('emails').with.lengthOf(2);
			done(err, customer);
		});
	});

	it('Should create another document', function(done) {
		Customer.create({
			name: 'Cristian Bullokles',
			emails: [
				'cris@bar.com',
			],
			age: 27,
		}, function(err, customer) {
			customer2 = customer;
			customer.should.have.property('name', 'Cristian Bullokles');
			customer.should.have.property('emails').with.lengthOf(1);
			done(err, customer);
		});
	});

	it('Should find a document by id', function(done) {
		Customer.find({where: {id: customer1.id}}, function(err, customer) {
			customer.should.be.array; // eslint-disable-line no-unused-expressions
			customer.should.containDeep([{id: customer1.id}]);
			done(err, customer);
		});
	});

	it('Should get object properties', function(done) {
		Customer.find({where: {id: customer1.id}}, function(err, customer) {
			customer.should.have.length(1);
			customer.should.containDeep([{name: customer1.name}]);
			customer.should.containDeep([{id: customer1.id}]);

			done(err, customer);
		});
	});

	it('Should get all documents', function(done) {
		Customer.all(function(err, customer) {
			customer.should.have.length(2);
			customer.should.containDeep([{id: customer1.id}]);
			customer.should.containDeep([{id: customer2.id}]);
			done(err, customer);
		});
	});

	it('Should find a documents by age less than 28', function(done) {
		Customer.find({where: {age: {'lt': 28}}}, function(err, customer) {
			customer.should.have.length(2);
			customer.should.containDeep([{age: 26}]);
			customer.should.containDeep([{id: customer1.id}]);
			done(err, customer);
		});
	});

	it('Should find a document by age equals to 26', function(done) {
		Customer.find({where: {age: customer1.age}}, function(err, customer) {
			customer.should.have.length(1);
			customer.should.containDeep([{age: customer1.age}]);
			customer.should.containDeep([{id: customer1.id}]);
			done(err, customer);
		});
	});

	it('Should Replace attributes for a model instance', function(done) {
		Customer.replaceById(customer1.id, {emails: ['bar@example.com']}, {validate: true}, function(err, customer) {
			customer.should.have.property('emails').with.lengthOf(1);
			done(err, customer);
		});
	});

	 it('Should delete a document', function(done) {
		Customer.destroyAll({id: customer1.id}, function(err, customer) {
			done(err, customer);
		});
	});

	it('Should delete all document', function(done) {
		Customer.destroyAll(null, function(err, customer) {
			done(err, customer);
		});
	});
});
