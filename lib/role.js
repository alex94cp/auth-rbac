function Role(auth, info) {
	this.auth_ = auth;
	this.info_ = info;
}

Object.defineProperty(Role.prototype, 'info', {
	get: function() { return this.info_; }
});

Role.prototype.hasPrivilege = function(priv, cb) {
	this.auth_.roleHasPrivilege_(this.info_, priv, function(err, hasPriv) {
		return cb(err, hasPriv);
	});
};

module.exports = Role;
