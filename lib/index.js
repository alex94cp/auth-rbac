var Authority = require('./authority');

function createAuthority(config) {
	return new Authority(config);
}

module.exports = exports = createAuthority;
exports.identify = require('./middleware/identify');
exports.requirePrivilege = require('./middleware/requirePrivilege');
