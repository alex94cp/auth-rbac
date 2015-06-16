var Authority = require('./authority');

function createAuthority(config) {
	if (!(config.getUser &&
	      config.userGetRole &&
	      config.roleHasPrivilege ))
		throw TypeError;
	
	return new Authorizator(config);
}

module.exports = exports = createAuthority;
exports.identify = require('./middleware/identify');
exports.requirePrivilege = require('./middleware/requirePrivilege');
