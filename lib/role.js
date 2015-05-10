function Role(auth, info) {
	this._auth = auth;
	this._info = info;
}

Object.defineProperty(Role.prototype, 'info', {
	get: function() { return this._info; }
});

Role.prototype.hasPrivilege = function(priv, cb) {
	this._auth._roleHasPrivilege(this._info, priv, function(err, hasPriv) {
		return cb(err, hasPriv);
	});
};

module.exports = Role;
