var auth = require('./common');
var chai = require('chai');
var expect = chai.expect;

describe('Auth', function() {
	describe('#authenticateUser', function() {
		it('should invoke callback with user object if valid credentials given', function(done) {
			auth.authenticateUser({ user: 'admin' }, function(err, user) {
				if (err)
					return done(err);
				expect(user).to.exist.and.have.property('info', 'admin');
				return done();
			});
		});

		it('should invoke callback with null otherwise', function(done) {
			auth.authenticateUser({ user: 'invalid' }, function(err, user) {
				if (err)
					return done(err);
				expect(user).to.not.exist;
				return done();
			});
		});
	});
});

describe('User', function() {
	var user;
	before(function(done) {
		auth.authenticateUser({ user: 'admin' }, function(err, adminUser) {
			if (err)
				return done(err);
			user = adminUser;
			return done();
		});
	});

	describe('#getRole', function() {
		it('should invoke callback with user role', function(done) {
			user.getRole(function(err, role) {
				if (err)
					return done(err);
				expect(role).to.exist.and.have.property('info', 'admin_r');
				return done();
			});
		});
	});
});

describe('Role', function() {
	var user, role;
	before(function(done) {
		auth.authenticateUser({ user: 'guest' }, function(err, guestUser) {
			if (err)
				return done(err);
			user = guestUser;
			user.getRole(function(err, guestRole) {
				if (err)
					return done(err);
				role = guestRole;
				return done();
			});
		});
	});

	describe('#hasPrivilege', function() {
		it('should invoke callback with true if role has privilege', function(done) {
			role.hasPrivilege('file-read', function(err, canReadFile) {
				if (err)
					return done(err);
				expect(canReadFile).to.be.true;
				return done();
			});
		});

		it('should return false otherwise', function(done) {
			role.hasPrivilege('file-write', function(err, canWriteFile) {
				if (err)
					return done(err);
				expect(canWriteFile).to.be.false;
				return done();
			});
		});
	});
});
