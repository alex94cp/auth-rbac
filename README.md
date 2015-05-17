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
authRbac.mongoose = require('auth-rbac-mongoose');
authRbac.httpBasic = require('auth-rbac-http-basic');

var User = require('./models/users');
var Group = require('./models/groups');

var Route = authRbac.mongoose.Route;
var credSchema = { name: String, pass: String };
var userRoute = new Route(credSchema).field('user').linkWith('name').gives(User);
var roleRoute = Route.newFrom(userRoute).field('group_id').dbRef.gives(Group);
var privRoute = Route.newFrom(roleRoute).field('privs');
var auth = authRbac.mongoose(userRoute, roleRoute, privRoute);

var express = require('express');
var app = express();

var httpBasic = authRbac.httpBasic('example');
app.use(authRbac.authenticate(auth, httpBasic));
app.get('/resources', authRbac.requirePrivilege(auth, 'resource-list', {
	onAccessGranted: function(req, res) {
		res.send('Access granted');
	}
}));
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
		// return user info or null
	},

	userGetRole: function(user, cb) {
		// return user role info or null
	},

	roleHasPrivilege: function(role, priv, cb) {
		// return whether role has privilege
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
