var rbac = require('../');
var auth = require('./common');
var assert = require('assert');

describe('authenticate', function() {
	var user = null;
	var role = null;
	var callback = null;
	
	before(function(done) {
		callback = rbac.authenticate(auth, function(req) {
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
		callback(req, {}, function(){
			assert('auth' in req);
			assert.deepEqual(req.auth.user, user);
			assert.deepEqual(req.auth.role, role);
			done();
		});
	});
	
	it('should return a function that calls next', function(done) {
		callback({}, {}, function() {
			done();
		});
	});
});
