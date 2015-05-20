var User = require('./user');

function AuthBackend(opts) {
	this._authenticateUser = opts.authenticateUser;
	this._userGetRole = opts.userGetRole;
	this._roleHasPrivilege = opts.roleHasPrivilege;
}

AuthBackend.prototype.authenticateUser = function(creds, cb) {
	var self = this;
	this._authenticateUser(creds, function(err, userInfo) {
		if (err)
			return cb(err);
		var user = userInfo ? new User(self, userInfo) : null;
		return cb(null, user);
	});
};

module.exports = AuthBackend;
