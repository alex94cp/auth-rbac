var Role = require('./role');

function User(auth, info) {
	this.auth_ = auth;
	this.info_ = info;
}

Object.defineProperty(User.prototype, 'info', {
	get: function() { return this.info_; }
});

User.prototype.getRole = function(cb) {
	if (this.role_ !== undefined)
		return cb(null, this.role_);

	var self = this;
	this.auth_.userGetRole_(this.info_, function(err, roleInfo) {
		if (err)
			return cb(err);

		var role = roleInfo ? new Role(self.auth_, roleInfo) : null;
		self.role_ = role;
		return cb(null, role);
	});
};

module.exports = User;
