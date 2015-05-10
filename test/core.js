var auth = require('./common');
var should = require('should');

describe('Auth', function() {
	describe('#authenticateUser', function() {
		it('should invoke callback with user object if valid credentials given', function(done) {
			auth.authenticateUser({ user: 'admin' }, function(err, user) {
				if (err)
					return done(err);
				(!!user).should.be.true;
				user.should.have.property('info', 'admin');
				return done();
			});
		});

		it('should invoke callback with null otherwise', function(done) {
			auth.authenticateUser({ user: 'invalid' }, function(err, user) {
				if (err)
					return done(err);
				(!!user).should.be.false;
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
				(!!role).should.be.true;
				role.should.have.property('info', 'admin_r');
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
				canReadFile.should.be.true;
				return done();
			});
		});

		it('should return false otherwise', function(done) {
			role.hasPrivilege('file-write', function(err, canWriteFile) {
				if (err)
					return done(err);
				canWriteFile.should.be.false;
				return done();
			});
		});
	});
});
