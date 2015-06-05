var Authenticator = require('./authenticator');
var Frontend = require('./frontend');
var Backend = require('./backend');

function createAuthenticator(frontend, backend) {
	return new Authenticator(frontend, backend);
};

module.exports = exports = createAuthenticator;

exports.frontend = function(opts) {
	return new Frontend(opts);
};

exports.backend = function(opts) {
	return new Backend(opts);
};
