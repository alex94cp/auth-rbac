var User = require('./user');

function validConfig(config) {
	return config.getUser !== undefined &&
	       config.userGetRole !== undefined &&
	       config.roleHasPrivilege !== undefined;
}

function Authority(config) {
	if (!(this instanceof Authority))
		return new Authority(config);
	
	if (!validConfig(config))
		throw new TypeError;
	
	this._config = config;
};

Authority.prototype.getUser = function(req, cb) {
	var self = this;
	this._config.getUser(req, function(err, userInfo) {
		if (err) return cb(err);
		var user = userInfo ? new User(self._config, userInfo) : null;
		cb(null, user);
	});
};

module.exports = Authority;
