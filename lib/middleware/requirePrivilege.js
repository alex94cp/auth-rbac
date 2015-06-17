var _ = require('lodash');
var identify = require('./identify');

function callNextMiddleware(req, res, next) {
	next();
}

function sendAccessDenied(req, res, next) {
	return res.sendStatus(401);
}

var defaultOptions = _.defaults({
	onAccessGranted: callNextMiddleware,
	onAccessDenied: sendAccessDenied,
}, identify.defaultOptions);

function requirePrivilege(priv, opts) {
	opts = _.defaults(opts || {}, defaultOptions);
	
	function passPriv(priv) {
		return function(req, cb) {
			cb(null, priv);
		};
	}
	
	return function(req, res, next) {
		if (req[opts.assignField] === undefined)
			throw new Error('auth info not found in request');
		
		var role = req[opts.assignField].role;
		if (!role)
			throw new Error('auth role could not be determined');
		
		var privCallback = priv instanceof Function ? priv : passPriv(priv);
		privCallback(req, function(err, requiredPriv) {
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
}

module.exports = exports = requirePrivilege;
exports.defaultOptions = defaultOptions;
