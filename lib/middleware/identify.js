var _ = require('lodash');

function identify(auth, opts) {
	opts = _.defaults(opts || {}, {
		assignProperty: 'auth'
	});
	
	function getUserAndRole(auth, req, cb) {
		auth.getUser(req, function(err, user) {
			if (err || !user)
				return cb(err, null);
			user.getRole(function(err, role) {
				if (err || !role)
					return cb(err, null);
				cb(null, { user: user, role: role });
			});
		});
	}
	
	function middleware(req, res, next) {
		if (req[opts.assignProperty] !== undefined)
			return next();
		getUserAndRole(auth, req, function(err, authInfo) {
			if (err)
				return next(err);
			req[opts.assignProperty] = authInfo;
			next();
		});
	}
	
	function validAuthority(authority) {
		return authority.getUser !== undefined;
	}
	
	if (!validAuthority(auth))
		throw new TypeError;
	return middleware;
}

module.exports = identify;
