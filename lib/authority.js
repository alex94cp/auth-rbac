var User = require('./user');

function Authority(config) {
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
