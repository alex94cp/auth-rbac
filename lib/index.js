var AuthBackend = require('./authBackend');

function authRbac(opts) {
	return new AuthBackend(opts);
}

module.exports = exports = authRbac;

exports.authenticate = function(auth, opts) {
	var extractCredentials = opts.extractCredentials;
	var askForCredentials = opts.askForCredentials;
	return function(req, res, next) {
		if (req.auth != null)
			return next();
		var creds = extractCredentials(req);
		if (!creds)
			return askForCredentials(res);
		req.auth = { user: null, role: null };
		auth.authenticateUser(creds, function(err, user) {
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
	};
};

function callNextMiddleware(req, res, next) {
	return next ? next() : res.end();
}

function sendAccessDenied(req, res, next) {
	return res.sendStatus(401);
}

exports.requirePrivilege = function(priv, opts) {
	opts = opts || {};
	var giveAccess = opts.onAccessGranted || callNextMiddleware;
	var denyAccess = opts.onAccessDenied  || sendAccessDenied;
	return function(req, res, next) {
		priv = priv instanceof Function ? priv(req) : priv;
		if (!priv)
			return giveAccess(req, res, next);
		if (!req.auth || !req.auth.role)
			return denyAccess(req, res, next);
		req.auth.role.hasPrivilege(priv, function(err, hasPriv) {
			if (err)
				return next(err);
			return hasPriv ? giveAccess(req, res, next)
			               : denyAccess(req, res, next);
		});
	};
};
