var _ = require('lodash');
var chai = require('chai');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var expect = chai.expect;
chai.use(require('sinon-chai'));

var Authority = require('../lib/authority');
var identify = require('../lib/middleware/identify');
var requirePrivilege = require('../lib/middleware/requirePrivilege');

function assertError(err) {
	expect(err).to.exist;
}

function assertNoError(err) {
	expect(err).to.not.exist;
};

describe('requirePrivilege', function() {
	var identifyMiddleware, onAccessGranted, onAccessDenied;
	before(function() {
		getUser = sinon.stub().callsArgWith(1, null, 'user-info');
		userGetRole = sinon.stub().callsArgWith(1, null, 'role-info');
		roleHasPrivilege = sinon.stub();
		var authority = new Authority({
			getUser: getUser,
			userGetRole: userGetRole,
			roleHasPrivilege: roleHasPrivilege
		});
		identifyMiddleware = identify(authority);
		onAccessGranted = sinon.spy();
		onAccessDenied = sinon.spy();
	});
	
	beforeEach(function() {
		getUser.reset();
		userGetRole.reset();
		roleHasPrivilege.reset();
		onAccessGranted.reset();
		onAccessDenied.reset();
	});
	
	it('throws an error if request does not have auth info', function() {
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var middleware = requirePrivilege('priv-name', {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		expect(function() {
			middleware(request, response, assertNoError);
		}).to.throw(Error);
	});
	
	it('throws an error if user has no identified role', function() {
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		request.auth = { user: 'user', role: null };
		var middleware = requirePrivilege('priv-name', {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		expect(function() {
			middleware(request, response, assertNoError);
		}).to.throw(Error);
	});
	
	it('invokes onAccessGranted callback if roleHasPrivilege gives true', function() {
		roleHasPrivilege.callsArgWith(2, null, true);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var requirePrivilegeCallback = requirePrivilege('priv-name');
		var middleware = requirePrivilege('priv-name', {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertNoError);
		expect(onAccessGranted).to.have.been.called;
		expect(onAccessDenied).to.not.have.been.called;
		expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
	});
	
	it('invokes onAccessDenied callback if roleHasPrivilege gives false', function() {
		roleHasPrivilege.callsArgWith(2, null, false);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var middleware = requirePrivilege('priv-name', {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertNoError);
		expect(onAccessGranted).to.not.have.been.called;
		expect(onAccessDenied).to.have.been.called;
		expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
	});
	
	it('gives onAccessDenied error if roleHasPrivilege gives false', function() {
		roleHasPrivilege.callsArgWith(2, null, false);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var middleware = requirePrivilege('priv-name', {
			onAccessGranted: onAccessGranted,
			onAccessDenied: new Error,
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertError);
		expect(onAccessGranted).to.not.have.been.called;
		expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
	});
	
	it('invokes privilege sync callback and requires returned privilege', function() {
		roleHasPrivilege.callsArgWith(2, null, true);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var expected = 'priv-name';
		var callback = function(req) { return expected; };
		var middleware = requirePrivilege(callback, {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertNoError);
		expect(onAccessGranted).to.have.been.called;
		expect(onAccessDenied).to.not.have.been.called;
		expect(roleHasPrivilege).to.have.been.calledWith('role-info', expected);
	});
	
	it('invokes privilege sync callback and grants access if it returns false', function() {
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var callback = function(req) { return false; };
		var middleware = requirePrivilege(callback, {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertNoError);
		expect(onAccessGranted).to.have.been.called;
		expect(onAccessDenied).to.not.have.been.called;
		expect(roleHasPrivilege).to.not.have.been.called;
	});
	
	it('propagates privilege sync callback returned errors', function() {
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var callback = function(req) { return new Error };
		var middleware = requirePrivilege(callback, {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertError);
		expect(onAccessGranted).to.not.have.been.called;
		expect(onAccessDenied).to.not.have.been.called;
		expect(roleHasPrivilege).to.not.have.been.called;
	});
	
	it('invokes privilege async callback and requires returned privilege', function() {
		roleHasPrivilege.callsArgWith(2, null, true);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var callback = sinon.stub().callsArgWith(1, null, 'priv-name');
		var middleware = requirePrivilege(callback, {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertNoError);
		expect(onAccessGranted).to.have.been.called;
		expect(onAccessDenied).to.not.have.been.called;
		expect(callback).to.have.been.calledWith(request);
		expect(roleHasPrivilege).to.have.been.calledWith('role-info', 'priv-name');
	});
	
	it('invokes privilege async callback and grants access if it returns false', function() {
		roleHasPrivilege.callsArgWith(2, null, true);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var callback = sinon.stub().callsArgWith(1, null, false);
		var middleware = requirePrivilege(callback, {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertNoError);
		expect(onAccessGranted).to.have.been.called;
		expect(onAccessDenied).to.not.have.been.called;
		expect(callback).to.have.been.calledWith(request);
		expect(roleHasPrivilege).to.not.have.been.called;
	});
	
	it('propagates privilege async callback returned errors', function() {
		roleHasPrivilege.callsArgWith(2, null, true);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var callback = sinon.stub().callsArgWith(1, new Error);
		var middleware = requirePrivilege(callback, {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertError);
		expect(onAccessGranted).to.not.have.been.called;
		expect(onAccessDenied).to.not.have.been.called;
		expect(callback).to.have.been.calledWith(request);
		expect(roleHasPrivilege).to.not.have.been.called;
	});
	
	it('propagates roleHasPrivilege errors', function() {
		roleHasPrivilege.callsArgWith(2, new Error);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var middleware = requirePrivilege('priv-name', {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, assertError);
		expect(onAccessGranted).to.not.have.been.called;
		expect(onAccessDenied).to.not.have.been.called;
		expect(roleHasPrivilege).to.have.been.called;
	});
});
