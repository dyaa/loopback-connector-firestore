'use strict';

require('./init.js');
var ds = getDataSource(); // eslint-disable-line no-undef

describe('Firestore collection', function() {
	var Customer = ds.createModel('customer', {
		name: String,
		emails: [String],
		age: Number,
	});

	var customerObj;

	it('should create a document', function(done) {
		Customer.create({
			name: 'Dyaa Eldin',
			emails: [
				'noreply@dyaa.me', 'foo@bar.com',
			],
			age: 26,
		}, function(err, customer) {
			customerObj = customer;
			customer.should.have.property('name', 'Dyaa Eldin');
			customer.should.have.property('emails').with.lengthOf(2);
			done(err, customer);
		});
	});

	it('should get all documents', function(done) {
		Customer.all(function(err, customer) {
			customer.should.be.array; // eslint-disable-line no-unused-expressions
			done(err, customer);
		});
	});

	it('should find a document by findById', function(done) {
		Customer.findById(customerObj.id, function(err, customer) {
			done(err, customer);
		});
	});

	it('should delete a document', function(done) {
		Customer.destroyAll({id: customerObj.id}, function(err, customer) {
			done(err, customer);
		});
	});
});
