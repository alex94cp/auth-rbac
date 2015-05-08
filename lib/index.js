var Auth = require('./auth');

function authRbac(opts) {
	return new Auth(opts || {});
}

module.exports = exports = authRbac;

exports.authenticate = function(auth, opts) {
	var credentialsGiven = opts.credentialsGiven;
	var askForCredentials = opts.askForCredentials;
	var extractCredentials = opts.extractCredentials;
	return function(req, res, next) {
		if (!credentialsGiven(req)) {
			askForCredentials(res);
			return next();
		}
		var creds = extractCredentials(req);
		auth.authenticateUser(creds, function(err, user) {
			if (err)
				return next(err);
			req.auth = {};
			if (!user)
				return next();
			req.auth.user = user;
			user.getRole(function(err, role) {
				if (err)
					return next(err);
				req.auth.role = role;
				return next();
			});
		});
	};
};

function sendAccessDenied(req, res, next) {
	res.sendStatus(401);
	return next();
}

exports.requirePrivilege = function(priv, opts) {
	var giveAccess = opts instanceof Function ? opts : opts.onAccessGranted;
	var denyAccess = opts.onAccessDenied || sendAccessDenied;
	return function(req, res, next) {
		if (priv instanceof Function)
			priv = priv(req);
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
