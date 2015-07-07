var _ = require('lodash');

function requirePrivilege(priv, opts) {
	function callNextMiddleware(req, res, next) {
		return next();
	}
	
	function sendAccessDenied(req, res, next) {
		return res.sendStatus(401);
	}
	
	opts = _.defaults({}, opts, {
		assignProperty: 'auth',
		onAccessGranted: callNextMiddleware,
		onAccessDenied: sendAccessDenied,
	});
	
	function resolvePrivilege(req, cb) {
		if (!_.isFunction(priv)) {
			return cb(null, priv);
		} else if (priv.length === 1) {
			try {
				var requiredPriv = priv(req);
				return cb(null, requiredPriv);
			} catch (err) { return cb(err); }
		} else {
			priv(req, cb);
		}
	}
	
	function middleware(req, res, next) {
		if (_.isUndefined(req[opts.assignProperty]))
			throw new Error('auth info not found in request');
		
		var role = req[opts.assignProperty].role;
		if (!role)
			throw new Error('auth role could not be determined');
		
		resolvePrivilege(req, function(err, requiredPriv) {
			if (err) return next(err);
			if (!requiredPriv)
				return opts.onAccessGranted(req, res, next);
			role.hasPrivilege(requiredPriv, function(err, hasPriv) {
				if (err) return next(err);
				hasPriv ? opts.onAccessGranted(req, res, next)
				        : opts.onAccessDenied(req, res, next);
			});
		});
	};
	
	return middleware;
}

module.exports = requirePrivilege;
