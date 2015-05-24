var Role = require('./role');

function User(backend, info) {
	this._backend = backend;
	this._info = info;
}

Object.defineProperty(User.prototype, 'info', {
	get: function() { return this._info; }
});

User.prototype.getRole = function(cb) {
	if (this._role !== undefined)
		return cb(null, this._role);
	var self = this;
	this._backend._userGetRole(this._info, function(err, roleInfo) {
		if (err)
			return cb(err);
		var role = roleInfo ? new Role(self._backend, roleInfo) : null;
		self._role = role;
		return cb(null, role);
	});
};

module.exports = User;
