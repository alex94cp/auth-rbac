var chai = require('chai');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var expect = chai.expect;
chai.use(require('sinon-chai'));

var Authorizator = require('../lib/authorizator');
var User = require('../lib/user');

describe('Authorizator', function() {
	describe('#getUser', function() {
		it('gives whatever getUser returns wrapped as a User instance', function() {
			var getUser = sinon.stub().callsArgWith(1, null, 'user-info');
			var authorizator = new Authorizator({ getUser: getUser });
			var request = httpMocks.createRequest();
			authorizator.getUser(request, function(err, user) {
				expect(err).to.not.exist;
				expect(user).to.be.an.instanceof(User)
				            .and.have.property('info', 'user-info');
				expect(getUser).to.have.been.calledWith(request);
			});
		});
		
		it('propagates getUser errors', function() {
			var getUser = sinon.stub().callsArgWith(1, new Error);
			var authorizator = new Authorizator({ getUser: getUser });
			var request = httpMocks.createRequest();
			authorizator.getUser(request, function(err, user) {
				expect(err).to.exist;
				expect(user).to.not.exist;
				expect(getUser).to.have.been.calledWith(request);
			});
		});
	});
});
