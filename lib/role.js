function Role(backend, info) {
	this._backend = backend;
	this._info = info;
}

Object.defineProperty(Role.prototype, 'info', {
	get: function() { return this._info; }
});

Role.prototype.hasPrivilege = function(priv, cb) {
	return this._backend._roleHasPrivilege(this._info, priv, cb);
};

module.exports = Role;
