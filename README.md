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

## Sample Usage

```js
var authRbac = require('auth-rbac');
var express = require('express');

var User = require('./models/user');
var Role = require('./models/role');

var auth = authRbac({
	getUser: function(req, cb) {
		cb(null, req.user);
	},
	
	userGetRole: function(user, cb) {
		Role.findById(user.role, cb);
	},
	
	roleHasPrivilege: function(role, priv, cb) {
		cb(null, role.privileges.indexOf(priv) !== -1);
	},
});

var app = express();
app.use(authRbac.identify(auth));
app.get('/users',
	authRbac.requirePrivilege('user:enum')
	function(req, res) {
		return res.sendStatus(200);
	});
```
