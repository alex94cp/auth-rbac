var auth = require('./common');
var should = require('should');
var httpMocks = require('node-mocks-http');

var rbac = require('../');
rbac.User = require('../lib/user');
rbac.Role = require('../lib/role');

var authCallback = rbac.authenticate(auth, {
	credentialsGiven: function(req) {
		return true;
	},
	
	extractCredentials: function(req) {
		return { user: 'guest', pass: '1234' };
	}
});

describe('authenticate', function() {
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
	
	it('should return a function that adds req.auth', function(done) {
		var req = httpMocks.createRequest();
		var res = httpMocks.createResponse();
		authCallback(req, res, function() {
			req.should.have.property('auth');
			req.auth.should.have.properties(['user', 'role']);
			req.auth.user.should.be.an.instanceof(rbac.User);
			req.auth.role.should.be.an.instanceof(rbac.Role);
			done();
		});
	});
	
	it('should return a function that calls next', function(done) {
		var req = httpMocks.createRequest();
		var res = httpMocks.createResponse();
		authCallback(req, res, function() {
			done();
		});
	});
});

describe('requirePrivilege', function() {
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
	
	var req = null;
	var res = null;
	
	beforeEach(function(done) {
		req = httpMocks.createRequest();
		res = httpMocks.createResponse();
		authCallback(req, res, done);
	});
	
	it('should call onAccessGranted if role has privilege', function(done) {
		rbac.requirePrivilege('file-read', {
			onAccessGranted: function(req, res) {
				done();
			}
		})(req, res);
	});
	
	it('should call onAccessDenied otherwise', function(done) {
		rbac.requirePrivilege('file-write', {
			onAccessDenied: function(req, res) {
				done();
			}
		})(req, res);
	});
});
