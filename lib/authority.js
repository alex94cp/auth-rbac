var _ = require('lodash');
var User = require('./user');

function Authority(config) {
	if (!validConfig(config))
		throw new TypeError;
	this._config = config;
	
	function validConfig(config) {
		return !_.isUndefined(config.getUser) &&
		       !_.isUndefined(config.userGetRole) &&
		       !_.isUndefined(config.roleHasPrivilege);
	}
};

function createAuthority(config) {
	return new Authority(config);
}

Authority.prototype.getUser = function(req, cb) {
	var self = this;
	this._config.getUser(req, function(err, userInfo) {
		if (err) return cb(err);
		var user = userInfo ? new User(self._config, userInfo) : null;
		cb(null, user);
	});
};

module.exports = exports = Authority;
exports.create = createAuthority;
