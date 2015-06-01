var User = require('./user');

function Backend(opts) {
	if (!(opts.authenticateUser && opts.userGetRole && opts.roleHasPrivilege))
		throw new Error();
	this._authenticateUser = opts.authenticateUser;
	this._userGetRole      = opts.userGetRole;
	this._roleHasPrivilege = opts.roleHasPrivilege;
}

Backend.prototype.authenticateUser = function(creds, cb) {
	var self = this;
	this._authenticateUser(creds, function(err, userModel) {
		if (err)
			return cb(err);
		var user = userModel ? new User(self, userModel) : null;
		return cb(null, user);
	});
};

module.exports = Backend;
