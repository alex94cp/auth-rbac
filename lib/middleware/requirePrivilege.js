var _ = require('lodash');

function requirePrivilege(priv, opts) {
	
	function callNextMiddleware(req, res, next) {
		return next();
	}
	
	function sendAccessDenied(req, res, next) {
		return res.sendStatus(401);
	}
	
	var defaultOptions = {
		assignProperty: 'auth',
		onAccessGranted: callNextMiddleware,
		onAccessDenied: sendAccessDenied,
	};
	
	opts = _.defaults(opts || {}, defaultOptions);
	
	return function(req, res, next) {
		if (req[opts.assignProperty] === undefined)
			throw new Error('auth info not found in request');
		
		var role = req[opts.assignProperty].role;
		if (!role)
			throw new Error('auth role could not be determined');
		
		var requiredPriv = priv instanceof Function ? priv(req) : priv;
		if (!requiredPriv)
			return opts.onAccessGranted(req, res, next);
		role.hasPrivilege(requiredPriv, function(err, hasPriv) {
			if (err) return next(err);
			hasPriv ? opts.onAccessGranted(req, res, next)
			        : opts.onAccessDenied(req, res, next);
		});
	};
}

module.exports = requirePrivilege;
