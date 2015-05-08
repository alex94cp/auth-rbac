var auth = require('./common');
var should = require('should');

describe('Auth', function() {
	describe('#authenticateUser', function() {
		it('should invoke callback with user object if valid credentials given', function(done) {
			auth.authenticateUser({ user: 'admin' }, function(err, user) {
				if (err)
					return done(err);
				user.should.be.ok;
				done();
			});
		});
		
		it('should invoke callback with null otherwise', function(done) {
			auth.authenticateUser({ user: 'invalid' }, function(err, user) {
				if (err)
					return done(err);
				(user === null).should.be.true;
				done();
			});
		});
	});
});

describe('User', function() {
	var user = null;
	
	before(function(done) {
		auth.authenticateUser({ user: 'admin' }, function(err, adminUser) {
			if (err)
				return done(err);
			user = adminUser;
			done();
		});
	});
	
	describe('#getRole', function() {
		it('should invoke callback with user role', function(done) {
			user.getRole(function(err, role) {
				if (err)
					return done(err);
				role.should.be.ok;
				done();
			});
		});
	});
});

describe('Role', function() {
	var user = null;
	var role = null;
	
	before(function(done) {
		auth.authenticateUser({ user: 'guest' }, function(err, guestUser) {
			if (err)
				return done(err);
			user = guestUser;
			user.getRole(function(err, guestRole) {
				if (err)
					return done(err);
				role = guestRole;
				done();
			});
		});
	});
	
	describe('#hasPrivilege', function() {
		it('should invoke callback with true if role has privilege', function(done) {
			role.hasPrivilege('file-read', function(err, canReadFile) {
				if (err)
					return done(err);
				canReadFile.should.be.true;
				done();
			});
		});
		
		it('should return false otherwise', function(done) {
			role.hasPrivilege('file-write', function(err, canWriteFile) {
				if (err)
					return done(err);
				canWriteFile.should.be.false;
				done();
			});
		});
	});
});
