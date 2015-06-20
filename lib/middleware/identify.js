var _ = require('lodash');

function identify(auth, opts) {
	
	function validAuthority(authority) {
		return authority.getUser !== undefined;
	}
	
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
	
	var defaultOptions = {
		assignProperty: 'auth',
	};
	
	opts = _.defaults(opts || {}, defaultOptions);
	
	if (!validAuthority(auth))
		throw new TypeError;
	
	return function(req, res, next) {
		if (req[opts.assignProperty] !== undefined)
			return next();
		getUserAndRole(auth, req, function(err, authInfo) {
			if (err)
				return next(err);
			req[opts.assignProperty] = authInfo;
			next();
		});
	};
}

module.exports = identify;
