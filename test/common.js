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
		var user = authInfo.userRoles[creds.user] ? creds.user : null;
		cb(null, user);
	},
	
	userGetRole: function(user, cb) {
		var role = authInfo.userRoles[user]
		cb(null, role);
	},
	
	roleHasPrivilege: function(role, priv, cb) {
		var hasPriv = authInfo.rolePrivileges[role].indexOf(priv) != -1
		cb(null, hasPriv);
	}
});
