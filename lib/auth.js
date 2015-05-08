var User = require('./user');

function Auth(opts) {
	this.authenticateUser_ = opts.authenticateUser;
	this.userGetRole_ = opts.userGetRole;
	this.roleHasPrivilege_ = opts.roleHasPrivilege;
}

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
