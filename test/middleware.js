var rbac = require('../');
var auth = require('./common');
var assert = require('assert');

describe('authenticate', function() {
	var authCallback = null;
	var user = null;
	var role = null;
	
	before(function(done) {
		authCallback = rbac.authenticate(auth, function(req) {
			return { user: 'guest' };
		});
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
	
	it('should return a function that adds req.auth', function(done) {
		var req = {};
		authCallback(req, {}, function(){
			assert('auth' in req);
			assert.deepEqual(req.auth.user, user);
			assert.deepEqual(req.auth.role, role);
			done();
		});
	});
	
	it('should return a function that calls next', function(done) {
		authCallback({}, {}, function() {
			done();
		});
	});
});

describe('requirePrivilege', function() {
	var authCallback = null;
	var user = null;
	var role = null;
	
	before(function(done) {
		authCallback = rbac.authenticate(auth, function(req) {
			return { user: 'guest' };
		});
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
	
	var req = {};
	
	beforeEach(function(done) {
		authCallback(req, {}, done);
	});
	
	it('should call onAccessGranted if role has privilege', function(done) {
		rbac.requirePrivilege('file-read', {
			onAccessGranted: function(req, res) {
				done();
			}
		})(req, {});
	});
	
	it('should call onAccessDenied otherwise', function(done) {
		rbac.requirePrivilege('file-write', {
			onAccessDenied: function(req, res) {
				done();
			}
		})(req, {});
	});
});
