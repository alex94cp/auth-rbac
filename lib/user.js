var Role = require('./role');

function User(config, info) {
	this._config = config;
	this._info = info;
}

Object.defineProperty(User.prototype, 'info', {
	get: function() { return this._info; }
});

User.prototype.getRole = function(cb) {
	if (this._role !== undefined)
		return cb(null, this._role);
	var self = this;
	this._config.userGetRole(this._info, function(err, roleInfo) {
		if (err)
			return cb(err);
		self._role = roleInfo ? new Role(self._config, roleInfo) : null;
		cb(null, self._role);
	});
};

module.exports = User;
