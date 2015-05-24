function AuthFrontend(opts) {
	if (!(opts.extractCredentials && opts.askForCredentials))
		throw new Error;
	this._extractCredentials = opts.extractCredentials;
	this._askForCredentials  = opts.askForCredentials;
}

AuthFrontend.prototype.extractCredentials = function(req) {
	return this._extractCredentials(req);
};

AuthFrontend.prototype.askForCredentials = function(res) {
	return this._askForCredentials(res);
};

module.exports = AuthFrontend;
