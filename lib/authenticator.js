function Authenticator(frontend, backend) {
	this._frontend = frontend;
	this._backend = backend;
}

Authenticator.prototype._doAuthenticate = function(req, res, cb) {
	var creds = this._frontend.extractCredentials(req);
	if (!creds)
		return this._frontend.askForCredentials(res);
	this._backend.authenticateUser(creds, function(err, user) {
		if (err)
			return cb(err);
		if (!user)
			return cb(null, { user: user });
		user.getRole(function(err, role) {
			if (err)
				return cb(err);
			cb(null, { user: user, role: role });
		});
	});
}

Authenticator.prototype.authenticate = function() {
	var self = this;
	return function(req, res, next) {
		if (req.auth !== undefined)
			return next();
		self._doAuthenticate(req, res, function(err, auth) {
			if (err)
				return next(err);
			req.auth = auth;
		});
	};
};

function callNextMiddleware(req, res, next) {
	return next();
}

function sendAccessDenied(req, res, next) {
	return res.sendStatus(403);
}

Authenticator.prototype.requirePrivilege = function(priv, opts) {
	opts = opts || {};
	var giveAccess = opts.onAccessGranted || callNextMiddleware;
	var denyAccess = opts.onAccessDenied  || sendAccessDenied;
	var self = this;
	return function doRequirePrivilege(req, res, next) {
		if (req.auth === undefined) {
			return self._doAuthenticate(req, res, function(err, auth) {
				if (err)
					return next(err);
				req.auth = auth;
				return doRequirePrivilege(req, res, next);
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

module.exports = Authenticator;
