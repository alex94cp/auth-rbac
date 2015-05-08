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
			req.auth.user = user;
			if (!user) {
				req.auth.role = null;
				return next();
			}
			user.getRole(function(err, role) {
				if (err)
					return next(err);
				req.auth.role = role;
				return next();
			});
		});
	};
};

function defaultDenyAccess(req, res, next) {
	res.sendStatus(401);
	return next();
}

exports.requirePrivilege = function(priv, opts) {
	var opts = opts || {};
	var giveAccess = opts.onAccessGranted;
	var denyAccess = opts.onAccessDenied || defaultDenyAccess;
	return function(req, res, next) {
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
