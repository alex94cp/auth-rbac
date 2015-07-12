var chai = require('chai');
var sinon = require('sinon');

var expect = chai.expect;
chai.use(require('sinon-chai'));

var User = require('../lib/user');
var Role = require('../lib/role');

describe('User', function() {
	describe('#info', function() {
		it('exposes user info', function() {
			var user = new User(undefined, 'user-info');
			expect(user).to.have.property('info', 'user-info');
		});
	});
	
	describe('#getRole', function() {
		it('gives whatever userGetRole returns wrapped as a Role instance', function() {
			var userGetRole = sinon.stub().callsArgWith(1, null, 'role-info');
			var user = new User({ userGetRole: userGetRole }, 'user-info');
			user.getRole(function(err, role) {
				expect(err).to.not.exist;
				expect(role).to.be.an.instanceof(Role);
				expect(role).to.have.property('info', 'role-info');
				expect(userGetRole).to.have.been.calledWith('user-info');
			});
		});
		
		it('propagates userGetRole errors', function() {
			var userGetRole = sinon.stub().callsArgWith(1, new Error);
			var user = new User({ userGetRole: userGetRole }, 'user-info');
			user.getRole(function(err, role) {
				expect(err).to.exist;
				expect(role).to.not.exist;
				expect(userGetRole).to.have.been.calledWith('user-info');
			});
		});
	});
});
