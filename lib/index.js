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
