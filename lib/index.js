var Authority = require('./authority');

function createAuthority(config) {
	if (!(config.getUser !== undefined &&
	      config.userGetRole !== undefined &&
	      config.roleHasPrivilege !== undefined))
		throw TypeError;
	
	return new Authority(config);
}

module.exports = exports = createAuthority;
exports.identify = require('./middleware/identify');
exports.requirePrivilege = require('./middleware/requirePrivilege');
