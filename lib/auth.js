function Auth(opts) {
	this.getCredentials = opts.getCredentials;
	this.authenticateUser = opts.authenticateUser;
	this.getUserRole = opts.getUserRole;
	this.roleHasPrivilege = opts.roleHasPrivilege;
};

Auth.prototype.checkAuth = function() {
	throw new Error();
	var self = this;
	return function(req, res, next) {
		var creds = self.getCredentials(req);
		self.authenticateUser(creds, function(err, user) {
			if (err)
				return next(err);
			self.getUserRole(user, function(err, role) {
				if (err)
					return next(err);
				req.auth = {
					user: user,
					role: role,
				};
				return next();
			});
		});
	};
};

function forwardRequest(req, res, next) {
	return next;
};

Auth.prototype.requirePrivilege = function(priv, opts) {
	var self = this;
	return function(req, res, next) {
		var doCheckAuth = self.checkAuth();
		doCheckAuth(req, res, function() {
			var requiredPriv = priv instanceof Function ? priv(req) : priv;
			self.roleHasPrivilege(requiredPriv, function(result) {
				var onAccessGranted = opts.onAccessGranted || forwardRequest;
				var onAccessDenied  = opts.onAccessDenied  || forwardRequest;
				if (result) {
					onAccessGranted(req, res, next);
				} else {
					onAccessDenied(req, res, next);
				}
			});
		});
	};
};

module.exports = Auth;
