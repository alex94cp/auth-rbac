var chai = require('chai');
var sinon = require('sinon');

var expect = chai.expect;
chai.use(require('sinon-chai'));

var Role = require('../lib/role');

describe('Role', function() {
	describe('#info', function() {
		it('exposes role info', function() {
			var role = new Role(undefined, 'role-info');
			expect(role).to.have.property('info', 'role-info');
		});
	});
	
	describe('#hasPrivilege', function() {
		it('gives true if roleHasPrivilege gives true', function() {
			var roleHasPrivilege = sinon.stub().callsArgWith(2, null, true);
			var role = new Role({ roleHasPrivilege: roleHasPrivilege }, 'role-info');
			role.hasPrivilege('priv-name', function(err, hasPrivilege) {
				expect(err).to.not.exist;
				expect(hasPrivilege).to.be.true;
				expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			});
		});
		
		it('gives false if roleHasPrivilege gives false', function() {
			var roleHasPrivilege = sinon.stub().callsArgWith(2, null, false);
			var role = new Role({ roleHasPrivilege: roleHasPrivilege }, 'role-info');
			role.hasPrivilege('priv-name', function(err, hasPrivilege) {
				expect(err).to.not.exist;
				expect(hasPrivilege).to.be.false;
				expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			});
		});
		
		it('propagates roleHasPrivilege errors', function() {
			var roleHasPrivilege = sinon.stub().callsArgWith(2, new Error);
			var role = new Role({ roleHasPrivilege: roleHasPrivilege }, 'role-info');
			role.hasPrivilege('priv-name', function(err, hasPrivilege) {
				expect(err).to.exist;
				expect(hasPrivilege).to.not.exist;
				expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			});
		});
	});
});
