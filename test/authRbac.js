var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var authRbac = require('../');
authRbac.User = require('../lib/user');
authRbac.Role = require('../lib/role');
var httpMocks = require('node-mocks-http');

var authenticateUser = sinon.stub();
var userGetRole = sinon.stub();
var roleHasPrivilege = sinon.stub();

var extractCredentials = sinon.stub();
var askForCredentials = sinon.stub();

describe('authRbac', function() {
	var auth;
	beforeEach(function() {
		auth = authRbac({
			authenticateUser: authenticateUser,
			userGetRole: userGetRole,
			roleHasPrivilege: roleHasPrivilege
		});
	});

	describe('authenticate', function() {
		var req, res, authCallback;
		beforeEach(function() {
			extractCredentials.reset();
			askForCredentials.reset();
			req = httpMocks.createRequest();
			res = httpMocks.createResponse();
			authCallback = authRbac.authenticate(auth, {
				extractCredentials: extractCredentials,
				askForCredentials: askForCredentials
			});
		});

		it('sets req.auth info', function() {
			extractCredentials.returns({ user: 'user-id' });
			authenticateUser.callsArgWith(1, null, 'user-info');
			userGetRole.callsArgWith(1, null, 'role-info');
			authCallback(req, res, function(err) {
				expect(err).to.not.exist;
				expect(req).to.have.property('auth');
				expect(req).to.have.deep.property('auth.user')
				           .which.is.an.instanceof(authRbac.User)
				           .and.has.property('info', 'user-info');
				expect(req).to.have.deep.property('auth.role')
				           .which.is.an.instanceof(authRbac.Role)
				           .and.has.property('info', 'role-info');
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
			authenticateUser.callsArgWith(1, null, 'user-info');
			userGetRole.callsArgWith(1, new Error);
			authCallback(req, res, function(err) {
				expect(err).to.exist;
				expect(req).to.have.property('auth');
				expect(req).to.have.deep.property('auth.user')
				           .which.is.an.instanceof(authRbac.User)
				           .and.has.property('info', 'user-info');
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

	describe('requirePrivilege', function() {
		var req, res;
		beforeEach(function() {
			roleHasPrivilege.reset();
			extractCredentials.returns({ user: 'user-id' });
			authenticateUser.callsArgWith(1, null, 'user-info');
			userGetRole.callsArgWith(1, null, 'role-info');
			var authCallback = authRbac.authenticate(auth, {
				extractCredentials: extractCredentials,
				askForCredentials: askForCredentials
			});
			req = httpMocks.createRequest();
			res = httpMocks.createResponse();
			authCallback(req, res, function(err) {
				expect(err).to.not.exist;
			});
		});

		it('invokes onAccessGranted if access allowed', function() {
			roleHasPrivilege.callsArgWith(2, null, true);
			var grantedCallback = sinon.spy();
			var deniedCallback = sinon.spy();
			var requirePrivCallback = authRbac.requirePrivilege('priv-name', {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, function(err) {
				expect(err).to.not.exist;
			});
			expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			expect(grantedCallback).to.have.been.called;
			expect(deniedCallback).to.not.have.been.called;
		});

		it('invokes onAccessGranted if no privilege required', function() {
			var grantedCallback = sinon.spy();
			var deniedCallback = sinon.spy();
			var requirePrivCallback = authRbac.requirePrivilege(null, {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, function(err) {
				expect(err).to.not.exist;
			});
			expect(roleHasPrivilege).to.not.have.been.called;
			expect(grantedCallback).to.have.been.called;
			expect(deniedCallback).to.not.have.been.called;
		});

		it('invokes onAccessDenied otherwise', function() {
			roleHasPrivilege.callsArgWith(2, null, false);
			var grantedCallback = sinon.spy();
			var deniedCallback = sinon.spy();
			var requirePrivCallback = authRbac.requirePrivilege('priv-name', {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, function(err) {
				expect(err).to.not.exist;
			});
			expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			expect(grantedCallback).to.not.have.been.called;
			expect(deniedCallback).to.have.been.called;
		});

		it('invokes priv callback to get required privilege', function() {
			roleHasPrivilege.callsArgWith(2, null, true);
			var privCallback = sinon.stub().returns('priv-name');
			var grantedCallback = sinon.spy();
			var deniedCallback = sinon.spy();
			var requirePrivCallback = authRbac.requirePrivilege(privCallback, {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, function(err) {
				expect(err).to.not.exist;
			});
			expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			expect(grantedCallback).to.have.been.called;
			expect(deniedCallback).to.not.have.been.called;
		});

		it('calls next middleware if onAccessGranted callback not given and access allowed', function() {
			roleHasPrivilege.callsArgWith(2, null, true);
			var requirePrivCallback = authRbac.requirePrivilege('priv-name');
			var nextCallback = sinon.spy();
			requirePrivCallback(req, res, nextCallback);
			expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			expect(nextCallback).to.have.been.called;
		});

		it('returns with error 200 if onAccessGranted callback not given and access allowed', function() {
			roleHasPrivilege.callsArgWith(2, null, true);
			var requirePrivCallback = authRbac.requirePrivilege('priv-name');
			requirePrivCallback(req, res);
			expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			expect(res).to.have.property('statusCode', 200);
		});

		it('responds with error 401 if onAccessDenied callback not given and access denied', function() {
			roleHasPrivilege.callsArgWith(2, null, false);
			var requirePrivCallback = authRbac.requirePrivilege('priv-name');
			var nextCallback = sinon.spy();
			requirePrivCallback(req, res, nextCallback);
			expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			expect(nextCallback).to.not.have.been.called;
			expect(res).to.have.property('statusCode', 401);
		});

		it('propagates roleHasPrivilege errors', function() {
			roleHasPrivilege.callsArgWith(2, new Error);
			var grantedCallback = sinon.spy();
			var deniedCallback = sinon.spy();
			var requirePrivCallback = authRbac.requirePrivilege('priv-name', {
				onAccessGranted: grantedCallback,
				onAccessDenied: deniedCallback
			});
			requirePrivCallback(req, res, function(err) {
				expect(err).to.exist;
			});
			expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
			expect(grantedCallback).to.not.have.been.called;
			expect(deniedCallback).to.not.have.been.called;
		});
	});
});
