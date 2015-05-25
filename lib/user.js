var Role = require('./role');

function User(backend, model) {
	this._backend = backend;
	this._model = model;
}

Object.defineProperty(User.prototype, 'model', {
	get: function() { return this._model; }
});

User.prototype.getRole = function(cb) {
	if (this._role !== undefined)
		return cb(null, this._role);
	var self = this;
	this._backend._userGetRole(this._model, function(err, roleModel) {
		if (err)
			return cb(err);
		var role = roleModel ? new Role(self._backend, roleModel) : null;
		self._role = role;
		return cb(null, role);
	});
};

module.exports = User;
