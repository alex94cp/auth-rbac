function Role(config, info) {
	this._config = config;
	this._info = info;
};

Object.defineProperty(Role.prototype, 'info', {
	get: function() { return this._info; }
});

Role.prototype.hasPrivilege = function(priv, cb) {
	this._config.roleHasPrivilege(this._info, priv, cb);
};

module.exports = Role;
