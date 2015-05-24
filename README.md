# auth-rbac

[![Build Status](https://travis-ci.org/alex94puchades/auth-rbac.svg?branch=master)](https://travis-ci.org/alex94puchades/auth-rbac)
[![Dependencies](https://david-dm.org/alex94puchades/auth-rbac.svg)](https://david-dm.org/alex94puchades/auth-rbac)
[![Coverage Status](https://coveralls.io/repos/alex94puchades/auth-rbac/badge.svg)](https://coveralls.io/r/alex94puchades/auth-rbac)
[![Join the chat at https://gitter.im/alex94puchades/auth-rbac](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/alex94puchades/auth-rbac?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

RBAC-based authorization library for [node](http://nodejs.org/)

## Installation

```bash
$ npm install auth-rbac
```

## Sample usage

```js
var authRbac = require('auth-rbac');
var authRbacMongoose = require('auth-rbac-mongoose');
var authRbacHttpBasic = require('auth-rbac-http-basic');

var User = require('./models/users');
var Group = require('./models/groups');

var express = require('express');
var app = express();

function checkUserCreds(params, cb) {
	var user = params.value;
	var creds = params.saved.creds;
	return cb(null, user.pass === creds.pass);
}

var Route = authRbacMongoose.Route;
var credRoute = new Route({ name: String, pass: String }).saveAs('creds');
var userRoute = credRoute.field('user').linkedWith('name').gives(User).assert(validUserCreds);
var roleRoute = Route.newFrom(userRoute).field('group_id').dbRef.gives(Group);
var privRoute = Route.newFrom(roleRoute).field('privs');

var frontend = authRbacHttpBasic('example');
var backend = authRbacMongoose(userRoute, roleRoute, privRoute);
var auth = authRbac(frontend, backend);

app.get('/resources', auth.requirePrivilege('resource-list', {
	onAccessGranted: function(req, res) {
		res.send('Access granted');
	}
}));

app.use('/debug', auth.requirePrivilege('devel-debug'));
app.get('/debug/say/:what', function(req, res) {
	req.send(req.params.what);
});
```

## Tips

For a better experience, you should make use of auth-rbac plugins, such as:

* [auth-rbac-http-basic](https://github.com/alex94puchades/auth-rbac-http-auth)
* [auth-rbac-mongoose](https://github.com/alex94puchades/auth-rbac-mongoose)

You are enticed to contribute with your own plugins. If you do so, make me know so that I can list it here with the others.

## Raw interface (for plugin developers)

```js
var auth = authRbac({
	authenticateUser: function(creds, cb) {
		// invoke cb with (err, user)
		//   where user can be null
	},

	userGetRole: function(user, cb) {
		// invoke cb with (err, role)
	},

	roleHasPrivilege: function(role, priv, cb) {
		// invoke cb with (err, hasPriv)
	}
});
```

```js
app.use(authRbac.authenticate(auth, {
	extractCredentials: function(req) {
		// return credentials in request or null
	},

	askForCredentials: function(res) {
		// ask for credentials, ie: res.sendStatus(401)
	}
}));
```
