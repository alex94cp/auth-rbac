function Role(auth, info) {
	this.auth_ = auth;
	this.info_ = info;
};

Role.prototype.hasPrivilege = function(priv, cb) {
	this.auth_.roleHasPrivilege_(this.info_, priv, function(err, hasPriv) {
		return cb(err, hasPriv);
	});
};

module.exports = Role;
