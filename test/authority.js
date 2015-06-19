var chai = require('chai');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var expect = chai.expect;
chai.use(require('sinon-chai'));

var Authority = require('../lib/authority');
var User = require('../lib/user');

describe('Authority', function() {
	var getUser, authority;
	before(function() {
		getUser = sinon.stub();
		authority = new Authority({
			getUser: getUser,
			userGetRole: sinon.stub(),
			roleHasPrivilege: sinon.stub(),
		});
	})
	
	beforeEach(function() {
		getUser.reset();
	});
	
	describe('#getUser', function() {
		it('gives whatever getUser returns wrapped as a User instance', function() {
			getUser.callsArgWith(1, null, 'user-info');
			var request = httpMocks.createRequest();
			authority.getUser(request, function(err, user) {
				expect(err).to.not.exist;
				expect(user).to.be.an.instanceof(User)
				            .and.have.property('info', 'user-info');
				expect(getUser).to.have.been.calledWith(request);
			});
		});
		
		it('propagates getUser errors', function() {
			getUser.callsArgWith(1, new Error);
			var request = httpMocks.createRequest();
			authority.getUser(request, function(err, user) {
				expect(err).to.exist;
				expect(user).to.not.exist;
				expect(getUser).to.have.been.calledWith(request);
			});
		});
	});
});
