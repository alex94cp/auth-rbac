var Auth = require('./auth');
var AuthFrontend = require('./authFrontend');
var AuthBackend = require('./authBackend');

function authRbac(frontend, backend) {
	return new Auth(frontend, backend);
};

authRbac.frontend = function(opts) {
	return new AuthFrontend(opts);
};

authRbac.backend = function(opts) {
	return new AuthBackend(opts);
};

module.exports = authRbac;
