var chai = require('chai');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var expect = chai.expect;
chai.use(require('sinon-chai'));

var Authority = require('../lib/authority');
var identify = require('../lib/middleware/identify');

describe('identify', function() {
	var getUser, userGetRole, authority;
	before(function() {
		getUser = sinon.stub();
		userGetRole = sinon.stub();
		authority = new Authority({
			getUser: getUser,
			userGetRole: userGetRole,
		});
	});
	
	beforeEach(function() {
		getUser.reset();
		userGetRole.reset();
	});
	
	it('fills request[assignField] with user and role info', function() {
		getUser.callsArgWith(1, null, 'user-info');
		userGetRole.callsArgWith(1, null, 'role-info');
		var middleware = identify(authority, { assignField: 'assignField' });
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		middleware(request, response, function(err) {
			expect(err).to.not.exist;
			expect(request).to.have.property('assignField');
			expect(getUser).to.have.been.calledWith(request);
			expect(userGetRole).to.have.been.calledWith('user-info');
		});
	});
	
	it('does not overwrite assignField if already present', function() {
		getUser.callsArgWith(1, null, 'user-info');
		userGetRole.callsArgWith(1, null, 'role-info');
		var middleware = identify(authority);
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		request.auth = 'my-value';
		middleware(request, response, function(err) {
			expect(err).to.not.exist;
			expect(request).to.have.property('auth', 'my-value');
			expect(getUser).to.not.have.been.called;
			expect(userGetRole).to.not.have.been.called;
		});
	});
	
	it('propagates getUser errors', function() {
		getUser.callsArgWith(1, new Error);
		var middleware = identify(authority, { assignField: 'assignField' });
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		middleware(request, response, function(err) {
			expect(err).to.exist;
			expect(request).to.not.have.property('assignField');
			expect(getUser).to.have.been.calledWith(request);
			expect(userGetRole).to.not.have.been.called;
		});
	});
	
	it('propagates userGetRole errors', function() {
		getUser.callsArgWith(1, null, 'user-info');
		userGetRole.callsArgWith(1, new Error);
		var middleware = identify(authority, { assignField: 'assignField' });
		var request = httpMocks.createRequest();
		var response = httpMocks.createResponse();
		middleware(request, response, function(err) {
			expect(err).to.exist;
			expect(request).to.not.have.property('assignField');
			expect(getUser).to.have.been.calledWith(request);
			expect(userGetRole).to.have.been.calledWith('user-info');
		});
	});
});
