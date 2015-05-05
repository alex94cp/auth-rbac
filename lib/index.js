var Auth = require('./auth.js');
var basicAuth = require('./basicAuth.js');

function authCreate(opts) {
	return new Auth(opts);
};

module.exports = exports = authCreate;
exports.basicAuth = basicAuth;
