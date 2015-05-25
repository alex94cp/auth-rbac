var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var authRbac = require('../');
authRbac.User = require('../lib/user');
authRbac.Role = require('../lib/role');
var httpMocks = require('node-mocks-http');

var extractCredentials = sinon.stub();
var askForCredentials = sinon.stub();

var authenticateUser = sinon.stub();
var userGetRole = sinon.stub();
var roleHasPrivilege = sinon.stub();

function noErrorCallback(err) {
	expect(err).to.not.exist;
}

describe('AuthRbac', function() {
	var auth;
	before(function() {
		var frontend = authRbac.frontend({
			extractCredentials: extractCredentials,
			askForCredentials: askForCredentials,
		});
		var backend = authRbac.backend({
			authenticateUser: authenticateUser,
			userGetRole: userGetRole,
			roleHasPrivilege: roleHasPrivilege
		});
		auth = authRbac(frontend, backend);
	});

	describe('#authenticate', function() {
		var req, res, authCallback;
		before(function() {
			authCallback = auth.authenticate();
		});

		beforeEach(function() {
			extractCredentials.reset();
			askForCredentials.reset();
			req = httpMocks.createRequest();
			res = httpMocks.createResponse();
		});

		it('sets req.auth info', function() {
			extractCredentials.returns({ user: 'user-id' });
			authenticateUser.callsArgWith(1, null, 'user-model');
			userGetRole.callsArgWith(1, null, 'role-model');
			authCallback(req, res, function(err) {
				expect(err).to.not.exist;
				expect(req).to.have.property('auth');
				expect(req).to.have.deep.property('auth.user')
				           .which.is.an.instanceof(authRbac.User)
				           .and.has.property('model', 'user-model');
				expect(req).to.have.deep.property('auth.role')
				           .which.is.an.instanceof(authRbac.Role)
				           .and.has.property('model', 'role-model');
			});
			expect(extractCredentials).to.have.been.calledWith(req);
			expect(askForCredentials).to.not.have.been.called;
		});

		it('does not populate req.auth if unknown user', function() {
			extractCredentials.returns({ user: 'user-id' });
			authenticateUser.callsArgWith(1, null, null);
			authCallback(req, res, function(err) {
				expect(err).to.not.exist;
				expect(req).to.have.deep.property('auth.user', null);
				expect(req).to.have.deep.property('auth.role', null);
			});
			expect(extractCredentials).to.have.been.calledWith(req);
			expect(askForCredentials).to.not.have.been.called;
		});

		it('does not overwrite req.auth if present', function() {
			req.auth = {};
			authCallback(req, res, function(err) {
				expect(err).to.not.exist;
				expect(req).to.not.have.deep.property('auth.user');
				expect(req).to.not.have.deep.property('auth.role');
			});
			expect(extractCredentials).to.not.have.been.called;
			expect(askForCredentials).to.not.have.been.called;
		});

		it('propagates authenticateUser errors', function() {
			extractCredentials.returns({ user: 'user-id' });
			authenticateUser.callsArgWith(1, new Error);
			authCallback(req, res, function(err) {
				expect(err).to.exist;
				expect(req).to.have.property('auth');
				expect(req).to.have.deep.property('auth.user', null);
				expect(req).to.have.deep.property('auth.role', null);
			});
			expect(extractCredentials).to.have.been.calledWith(req);
			expect(askForCredentials).to.not.have.been.called;
		});

		it('propagates userGetRole errors', function() {
			extractCredentials.returns({ user: 'user-id' });
			authenticateUser.callsArgWith(1, null, 'user-model');
			userGetRole.callsArgWith(1, new Error);
			authCallback(req, res, function(err) {
				expect(err).to.exist;
				expect(req).to.have.property('auth');
				expect(req).to.have.deep.property('auth.user')
				           .which.is.an.instanceof(authRbac.User)
				           .and.has.property('model', 'user-model');
				expect(req).to.have.deep.property('auth.role', null);
			});
			expect(extractCredentials).to.have.been.calledWith(req);
			expect(askForCredentials).to.not.have.been.called;
		});

		it('calls askForCredentials if no credentials given', function() {
			extractCredentials.returns(null);
			var nextCallback = sinon.spy();
			authCallback(req, res, nextCallback);
			expect(nextCallback).to.not.have.been.called;
			expect(extractCredentials).to.have.been.calledWith(req);
			expect(askForCredentials).to.have.been.calledWith(res);
		});
	});

	describe('#requirePrivilege', function() {
		var req, res;
		var grantedCallback, deniedCallback;

		before(function() {
			extractCredentials.returns({ user: 'user-id' });
			authenticateUser.callsArgWith(1, null, 'user-model');
			userGetRole.callsArgWith(1, null, 'role-model');
		});

		beforeEach(function() {
			roleHasPrivilege.reset();
			req = httpMocks.createRequest();
			res = httpMocks.createResponse();
			grantedCallback = sinon.spy();
			deniedCallback = sinon.spy();
		});

		it('invokes onAccessGranted if access allowed', function() {
			roleHasPrivilege.callsArgWith(2, null, true);
			var requirePrivCallback = auth.requirePrivilege('priv-name', {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, noErrorCallback);
			expect(roleHasPrivilege).to.have.been.calledWith('role-model', 'priv-name');
			expect(grantedCallback).to.have.been.called;
			expect(deniedCallback).to.not.have.been.called;
		});

		it('invokes onAccessGranted if no privilege required', function() {
			var requirePrivCallback = auth.requirePrivilege(null, {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, noErrorCallback);
			expect(roleHasPrivilege).to.not.have.been.called;
			expect(grantedCallback).to.have.been.called;
			expect(deniedCallback).to.not.have.been.called;
		});

		it('invokes onAccessDenied otherwise', function() {
			roleHasPrivilege.callsArgWith(2, null, false);
			var requirePrivCallback = auth.requirePrivilege('priv-name', {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, noErrorCallback);
			expect(roleHasPrivilege).to.have.been.calledWith('role-model', 'priv-name');
			expect(grantedCallback).to.not.have.been.called;
			expect(deniedCallback).to.have.been.called;
		});

		it('invokes priv callback to get required privilege', function() {
			roleHasPrivilege.callsArgWith(2, null, true);
			var privCallback = sinon.stub().returns('priv-name');
			var requirePrivCallback = auth.requirePrivilege(privCallback, {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, noErrorCallback);
			expect(roleHasPrivilege).to.have.been.calledWith('role-model', 'priv-name');
			expect(grantedCallback).to.have.been.called;
			expect(deniedCallback).to.not.have.been.called;
		});

		it('calls next middleware if onAccessGranted callback not given and access allowed', function() {
			roleHasPrivilege.callsArgWith(2, null, true);
			var nextCallback = sinon.spy();
			auth.requirePrivilege('priv-name')(req, res, nextCallback);
			expect(roleHasPrivilege).to.have.been.calledWith('role-model', 'priv-name');
			expect(nextCallback).to.have.been.called;
		});

		it('responds with error 401 if onAccessDenied callback not given and access denied', function() {
			roleHasPrivilege.callsArgWith(2, null, false);
			var nextCallback = sinon.spy();
			auth.requirePrivilege('priv-name')(req, res, nextCallback);
			expect(roleHasPrivilege).to.have.been.calledWith('role-model', 'priv-name');
			expect(nextCallback).to.not.have.been.called;
			expect(res).to.have.property('statusCode', 401);
		});

		it('propagates roleHasPrivilege errors', function() {
			roleHasPrivilege.callsArgWith(2, new Error);
			var requirePrivCallback = auth.requirePrivilege('priv-name', {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, function(err) {
				expect(err).to.exist;
			});
			expect(roleHasPrivilege).to.have.been.calledWith('role-model', 'priv-name');
			expect(grantedCallback).to.not.have.been.called;
			expect(deniedCallback).to.not.have.been.called;
		});
	});
});
