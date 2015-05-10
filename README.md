# auth-rbac

RBAC-based authorization library for [node](http://nodejs.org/)

[![Build Status](https://travis-ci.org/alex94puchades/auth-rbac.svg?branch=master)](https://travis-ci.org/alex94puchades/auth-rbac)
[![Dependencies](https://david-dm.org/alex94puchades/auth-rbac.svg)](https://david-dm.org/alex94puchades/auth-rbac)

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
var credRoute = new Route({ name: String, pass: String });
var userRoute = Route.newFrom(credRoute).field('user').linkWith('name').gives(User);
var roleRoute = Route.newFrom(userRoute).field('group_id').dbRef.gives(Group);
var privRoute = Route.newFrom(roleRoute).field('privs').gives([String]);
var auth = authRbac.mongoose(userRoute, roleRoute, privRoute);

var express = require('express');
var app = express();

app.use(authRbac.httpBasic(auth, 'example'));
app.get('/resources', authRbac.requirePrivilege(auth, 'resource-list', function(req, res) {
	res.send('Access granted');
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
