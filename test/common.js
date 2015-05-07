var rbac = require('../');

var authInfo = {
	userRoles: {
		admin: 'admin_r',
		guest: 'guest_r'
	},
	rolePrivileges: {
		admin_r: [ 'file-read', 'file-write' ],
		guest_r: [ 'file-read' ]
	}
};

module.exports = rbac({
	authenticateUser: function(creds, cb) {
		var err = null;
		var user = authInfo.userRoles[creds.user] ? creds.user : null;
		cb(err, user);
	},
	userGetRole: function(user, cb) {
		var err = null;
		var role = authInfo.userRoles[user]
		cb(err, role);
	},
	roleHasPrivilege: function(role, priv, cb) {
		var err = null;
		var hasPriv = authInfo.rolePrivileges[role].indexOf(priv) != -1
		cb(err, hasPriv);
	}
});
