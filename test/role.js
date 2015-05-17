var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var authRbac = require('../');
authRbac.User = require('../lib/user');
authRbac.Role = require('../lib/role');

var authenticateUserStub = sinon.stub();
var userGetRoleStub = sinon.stub();
var roleHasPrivilegeStub = sinon.stub();

describe('Role', function() {
	var auth, role;
	before(function() {
		auth = authRbac({
			authenticateUser: authenticateUserStub,
			userGetRole: userGetRoleStub,
			roleHasPrivilege: roleHasPrivilegeStub
		});
	});

	beforeEach(function() {
		role = new authRbac.Role(auth, 'role-info');
	});

	describe('#info', function() {
		it('returns role info', function() {
			expect(role).to.have.property('info', 'role-info');
		});
	});

	describe('#hasPrivilege', function() {
		it('invokes callback with true if stub returns true', function() {
			roleHasPrivilegeStub.callsArgWith(2, null, true);
			role.hasPrivilege('priv-name', function(err, hasPriv) {
				expect(err).to.not.exist;
				expect(hasPriv).to.be.true;
			});
			expect(roleHasPrivilegeStub).to.have.been.calledWith('role-info', 'priv-name');
		});

		it('invokes callback with false otherwise', function() {
			roleHasPrivilegeStub.callsArgWith(2, null, false);
			role.hasPrivilege('priv-name', function(err, hasPriv) {
				expect(err).to.not.exist;
				expect(hasPriv).to.be.false;
			});
			expect(roleHasPrivilegeStub).to.have.been.calledWith('role-info', 'priv-name');
		});

		it('propagates stub errors', function() {
			roleHasPrivilegeStub.callsArgWith(2, new Error);
			role.hasPrivilege('priv-name', function(err, hasPriv) {
				expect(err).to.exist;
				expect(hasPriv).to.not.exist;
			});
			expect(roleHasPrivilegeStub).to.have.been.calledWith('role-info', 'priv-name');
		});
	});
})
