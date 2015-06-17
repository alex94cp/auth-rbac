var chai = require('chai');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var expect = chai.expect;
chai.use(require('sinon-chai'));

var Authority = require('../lib/authority');
var identify = require('../lib/middleware/identify');
var requirePrivilege = require('../lib/middleware/requirePrivilege');

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
	
	it('calls onAccessGranted if roleHasPrivilege gives true', function() {
		roleHasPrivilege.callsArgWith(2, null, true);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var requirePrivilegeCallback = requirePrivilege('priv-name');
		var middleware = requirePrivilege('priv-name', {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, function(err) {
			expect(err).to.not.exist;
			expect(onAccessGranted).to.have.been.called;
			expect(onAccessDenied).to.not.have.been.called;
			expect(roleHasPrivilege).to.have.been.calledWith(null, 'role-info', 'priv-name');
		});
	});
	
	it('calls onAccessDenied if roleHasPrivilege gives false', function() {
		roleHasPrivilege.callsArgWith(2, null, false);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var middleware = requirePrivilege('priv-name', {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, function(err) {
			expect(err).to.not.exist;
			expect(onAccessGranted).to.not.have.been.called;
			expect(onAccessDenied).to.have.been.called;
			expect(roleHasPrivilege).to.have.been.calledWith(null, 'role-info', 'priv-name');
		});
	});
	
	it('invokes privilege callback and requires returned privilege', function() {
		roleHasPrivilege.callsArgWith(2, null, true);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		var callback = sinon.stub().callsArgWith(0, null, 'priv-name');
		var middleware = requirePrivilege(callback, {
			onAccessGranted: onAccessGranted,
			onAccessDenied: onAccessDenied
		});
		identifyMiddleware(request, response, assertNoError);
		middleware(request, response, function(err) {
			expect(err).to.not.exist;
			expect(onAccessGranted).to.have.been.called;
			expect(onAccessDenied).to.not.have.been.called;
			expect(callback).to.have.been.calledWith(request);
			expect(roleHasPrivilege).to.have.been.calledWith(null, 'role-info', 'priv-name');
		});
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
		middleware(request, response, function(err) {
			expect(err).to.exist;
			expect(onAccessGranted).to.not.have.been.called;
			expect(onAccessDenied).to.not.have.been.called;
			expect(roleHasPrivilege).to.have.been.called;
		});
	});
});
