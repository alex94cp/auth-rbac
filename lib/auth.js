var User = require('./user');

function defaultAuthenticateUser(creds) {
	return null;
};

function defaultUserGetRole(user) {
	return null;
};

function defaultRoleHasPrivilege(role, priv) {
	return null;
};

function Auth(opts) {
	var opts = opts || {};
	this.authenticateUser_ = opts.authenticateUser || defaultAuthenticateUser;
	this.userGetRole_ = opts.userGetRole || defaultUserGetRole;
	this.roleHasPrivilege_ = opts.roleHasPrivilege || defaultRoleHasPrivilege;
};

Auth.prototype.authenticateUser = function(creds, cb) {
	var self = this;
	this.authenticateUser_(creds, function(err, userInfo) {
		if (err)
			return cb(err);
		
		var user = userInfo ? new User(self, userInfo) : null;
		return cb(null, user);
	});
};

module.exports = Auth;
