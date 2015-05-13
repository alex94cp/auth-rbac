var auth = require('./common');
var authRbac = require('../');
authRbac.User = require('../lib/user');
authRbac.Role = require('../lib/role');

var chai = require('chai');
var expect = chai.expect;
var httpMocks = require('node-mocks-http');

var authCallback = authRbac.authenticate(auth, {
	credentialsGiven: function(req) {
		return true;
	},

	extractCredentials: function(req) {
		return { user: 'guest', pass: '1234' };
	}
});

function checkRequestAuthInfo(req) {
	expect(req).to.have.deep.property('auth.user')
	           .that.is.an.instanceof(authRbac.User)
	           .and.has.property('info', 'guest');
	expect(req).to.have.deep.property('auth.role')
	           .that.is.an.instanceof(authRbac.Role)
	           .and.has.property('info', 'guest_r');
}

describe('authenticate', function() {
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

	it('should return a function that adds req.auth', function(done) {
		var req = httpMocks.createRequest();
		var res = httpMocks.createResponse();
		authCallback(req, res, function(err) {
			if (err)
				return done(err);
			checkRequestAuthInfo(req);
			return done();
		});
	});

	it('should return a function that calls next', function(done) {
		var req = httpMocks.createRequest();
		var res = httpMocks.createResponse();
		authCallback(req, res, function(err) {
			if (err)
				return done(err);
			return done();
		});
	});
});

describe('requirePrivilege', function() {
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

	var req = null;
	var res = null;

	beforeEach(function(done) {
		req = httpMocks.createRequest();
		res = httpMocks.createResponse();
		authCallback(req, res, done);
	});

	it('should call onAccessGranted if access is granted', function(done) {
		authRbac.requirePrivilege('file-read', {
			onAccessGranted: function(req, res) {
				return done();
			}
		})(req, res);
	});

	it('should accept a function to evaluate required privilege at request time', function(done) {
		authRbac.requirePrivilege(function(req) { return 'file-read'; }, {
			onAccessGranted: function(req, res) {
				return done();
			}
		})(req, res);
	});

	it('should also accept a function to call if access is granted', function(done) {
		authRbac.requirePrivilege('file-read', function(req, res) {
			return done();
		})(req, res);
	});

	it('should call onAccessDenied otherwise', function(done) {
		authRbac.requirePrivilege('file-write', {
			onAccessDenied: function(req, res) {
				return done();
			}
		})(req, res);
	});
});
