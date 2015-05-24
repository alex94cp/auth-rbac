function Auth(frontend, backend) {
	this._frontend = frontend;
	this._backend = backend;
}

Auth.prototype._doAuthenticate = function(req, res, next) {
	var creds = this._frontend.extractCredentials(req);
	if (!creds)
		return this._frontend.askForCredentials(res);
	req.auth = { user: null, role: null };
	return this._backend.authenticateUser(creds, function(err, user) {
		if (err)
			return next(err);
		req.auth.user = user;
		if (!user)
			return next();
		user.getRole(function(err, role) {
			if (err)
				return next(err);
			req.auth.role = role;
			return next();
		});
	});
}

Auth.prototype.authenticate = function() {
	var self = this;
	return function(req, res, next) {
		if (req.auth != null)
			return next();
		return self._doAuthenticate(req, res, next);
	}
};

function callNextMiddleware(req, res, next) {
	return next ? next() : res.end();
}

function sendAccessDenied(req, res, next) {
	return res.sendStatus(401);
}

Auth.prototype.requirePrivilege = function(priv, opts) {
	opts = opts || {};
	var giveAccess = opts.onAccessGranted || callNextMiddleware;
	var denyAccess = opts.onAccessDenied  || sendAccessDenied;
	var self = this;
	return function requirePrivMiddleware(req, res, next) {
		if (req.auth == null) {
			return self._doAuthenticate(req, res, function() {
				return requirePrivMiddleware(req, res, next);
			});
		}
		priv = priv instanceof Function ? priv(req) : priv;
		if (!priv)
			return giveAccess(req, res, next);
		if (!req.auth.role)
			return denyAccess(req, res, next);
		req.auth.role.hasPrivilege(priv, function(err, hasPriv) {
			if (err)
				return next(err);
			return hasPriv ? giveAccess(req, res, next)
						   : denyAccess(req, res, next);
		});
	};
};

module.exports = Auth;
