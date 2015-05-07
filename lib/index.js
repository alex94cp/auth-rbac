var Auth = require('./auth');

function authCreate(opts) {
	return new Auth(opts);
};

module.exports = exports = authCreate;

exports.authenticate = function(auth, getCredentials) {
	return function(req, res, next) {
		var creds = getCredentials(req);
		auth.authenticateUser(creds, function(err, user) {
			if (err)
				return next(err);
			req.auth = {};
			req.auth.user = user;
			user.getRole(function(err, role) {
				if (err)
					return next(err);
				req.auth.role = role;
				next();
			});
		});
	};
};

function defaultOnAccessGranted(req, res, next) {
	return next();
};

function defaultOnAccessDenied(req, res, next) {
	res.sendStatus(401);
	return next();
};

exports.requirePrivilege = function(priv, opts) {
	var opts = opts || {};
	var giveAccess = opts.onAccessGranted || defaultOnAccessGranted;
	var denyAccess = opts.onAccessDenied  || defaultOnAccessDenied;
	return function(req, res, next) {
		if (!'auth' in req)
			next(new Error('auth-rbac middleware not used'));
		req.auth.role.hasPrivilege(priv, function(err, hasPriv) {
			if (err)
				return next(err);
			if (hasPriv)
				giveAccess(req, res, next);
			else
				denyAccess(req, res, next);
		});
	};
};
