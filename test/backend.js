var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var authRbac = require('../');
authRbac.User = require('../lib/user');

var authenticateUser = sinon.stub();
var userGetRole = sinon.stub();
var roleHasPrivilege = sinon.stub();

describe('Backend', function() {
	var backend;
	beforeEach(function() {
		backend = authRbac.backend({
			authenticateUser: authenticateUser,
			userGetRole: userGetRole,
			roleHasPrivilege: roleHasPrivilege
		});
	});

	describe('#authenticateUser', function() {
		it('invokes callback with user', function() {
			var creds = { user: 'user-id' };
			authenticateUser.callsArgWith(1, null, 'user-model');
			backend.authenticateUser(creds, function(err, user) {
				expect(err).to.not.exist;
				expect(user).to.be.an.instanceof(authRbac.User)
				            .and.have.property('model', 'user-model');
			});
			expect(authenticateUser).to.have.been.calledWith(creds);
		});

		it('propagates authenticateUser callback errors', function() {
			var creds = { user: 'user-id' };
			authenticateUser.callsArgWith(1, new Error);
			backend.authenticateUser(creds, function(err, user) {
				expect(err).to.exist;
				expect(user).to.not.exist;
			});
			expect(authenticateUser).to.have.been.calledWith(creds);
		});
	});
});