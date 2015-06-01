var Auth = require('./auth');
var Frontend = require('./frontend');
var Backend = require('./backend');

function authRbac(frontend, backend) {
	return new Auth(frontend, backend);
};

authRbac.frontend = function(opts) {
	return new Frontend(opts);
};

authRbac.backend = function(opts) {
	return new Backend(opts);
};

module.exports = authRbac;
