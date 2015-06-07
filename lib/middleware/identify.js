var _ = require('lodash');
var Authorizator = require('../authorizator');

var defaultOptions = {
	outputField: 'auth'
};

function identify(auth, opts) {
	opts = _.defaults(opts || {}, defaultOptions);
	
	if (!(auth instanceof Authorizator))
		throw TypeError;
	
	return function(req, res, next) {
		if (req[opts.outputField] !== undefined)
			return next();
		getUserAndRole(auth, req, function(err, authInfo) {
			if (err)
				return next(err);
			req[opts.outputField] = authInfo;
			next();
		});
	};
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

module.exports = exports = identify;
exports.defaultOptions = defaultOptions;
