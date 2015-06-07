var Authorizator = require('./authorizator');

function createAuthorizator(config) {
	if (!(config.getUser &&
	      config.userGetRole &&
	      config.roleHasPrivilege ))
		throw TypeError;
	
	return new Authorizator(config);
}

module.exports = exports = createAuthorizator;
exports.identify = require('./middleware/identify');
exports.requirePrivilege = require('./middleware/requirePrivilege');
