var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var authRbac = require('../');
authRbac.User = require('../lib/user');
authRbac.Role = require('../lib/role');

var authenticateUser = sinon.stub();
var userGetRole = sinon.stub();
var roleHasPrivilege = sinon.stub();

describe('User', function() {
	var backend;
	before(function() {
		backend = authRbac.backend({
			authenticateUser: authenticateUser,
			userGetRole: userGetRole,
			roleHasPrivilege: roleHasPrivilege
		});
	});

	var user;
	beforeEach(function() {
		user = new authRbac.User(backend, 'user-info');
	});

	describe('#info', function() {
		it('returns user info', function() {
			expect(user).to.have.property('info', 'user-info');
		});
	});

	describe('#getRole', function() {
		beforeEach(function() {
			userGetRole.reset();
		});

		it('invokes callback with role', function() {
			userGetRole.callsArgWith(1, null, 'role-info');
			user.getRole(function(err, role) {
				expect(err).to.not.exist;
				expect(role).to.be.an.instanceof(authRbac.Role)
				            .and.have.property('info', 'role-info');
			});
			expect(userGetRole).to.have.been.calledWith('user-info');
		});

		it('invokes callback with null if userGetRole returns null', function() {
			userGetRole.callsArgWith(1, null, null);
			user.getRole(function(err, role) {
				expect(err).to.not.exist;
				expect(role).to.not.exist;
			});
			expect(userGetRole).to.have.been.calledWith('user-info');
		});

		it('propagates userGetRole callback errors', function() {
			userGetRole.callsArgWith(1, new Error);
			user.getRole(function(err, role) {
				expect(err).to.exist;
				expect(role).to.not.exist;
			});
			expect(userGetRole).to.have.been.calledWith('user-info');
		});

		it('caches userGetRole callback result', function() {
			userGetRole.callsArgWith(1, null, 'role-info');
			var callback = function(err, role) {
				expect(err).to.not.exist;
				expect(role).to.be.an.instanceof(authRbac.Role)
				            .and.have.property('info', 'role-info');
			};
			user.getRole(callback);
			user.getRole(callback);
			expect(userGetRole).to.have.been.calledOnce;
		});

		it('retries call if userGetRole callback returns error', function() {
			userGetRole.onFirstCall().callsArgWith(1, new Error)
			           .onSecondCall().callsArgWith(1, null, 'role-info');
			user.getRole(function(err, role) {
				expect(err).to.exist;
				expect(role).to.not.exist;
			});
			user.getRole(function(err, role) {
				expect(err).to.not.exist;
				expect(role).to.be.an.instanceof(authRbac.Role)
				            .and.have.property('info', 'role-info');
			});
			expect(userGetRole).to.have.been.calledTwice;
		});
	});
});
