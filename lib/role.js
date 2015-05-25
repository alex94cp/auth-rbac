function Role(backend, model) {
	this._backend = backend;
	this._model = model;
}

Object.defineProperty(Role.prototype, 'model', {
	get: function() { return this._model; }
});

Role.prototype.hasPrivilege = function(priv, cb) {
	return this._backend._roleHasPrivilege(this._model, priv, cb);
};

module.exports = Role;
