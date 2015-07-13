var _ = require('lodash');

function requirePrivilege(priv, opts) {
	opts = _.defaults({}, opts, {
		assignProperty: 'auth',
		onAccessGranted: callNextMiddleware,
		onAccessDenied: sendAccessDenied,
	});
	return middleware;
	
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
	
	function callNextMiddleware(req, res, next) {
		return next();
	}
	
	function sendAccessDenied(req, res, next) {
		return res.sendStatus(401);
	}
	
	function resolvePrivilege(req, cb) {
		if (_.isString(priv))
			return cb(null, priv);
		if (_.isFunction(priv)) {
			if (priv.length === 1) {
				var result = priv(req);
				if (_.isError(result))
					return cb(result);
				return cb(null, result);
			} else {
				return priv(req, cb);
			}
		}
		throw new TypeError('invalid privilege callback');
	}
}

module.exports = requirePrivilege;
