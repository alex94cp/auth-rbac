var _ = require('lodash');

function identify(auth, opts) {
	opts = _.defaults({}, opts, {
		assignProperty: 'auth',
	});
	if (!validAuthority(auth))
		throw new TypeError;
	return middleware;
	
	function middleware(req, res, next) {
		if (!_.isUndefined(req[opts.assignProperty]))
			return next();
		getUserAndRole(auth, req, function(err, authInfo) {
			if (err)
				return next(err);
			req[opts.assignProperty] = authInfo;
			next();
		});
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
	
	function validAuthority(authority) {
		return !_.isUndefined(authority.getUser);
	}
}

module.exports = identify;
