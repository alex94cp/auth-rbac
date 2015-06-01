function Frontend(opts) {
	if (!(opts.extractCredentials && opts.askForCredentials))
		throw new Error;
	this._extractCredentials = opts.extractCredentials;
	this._askForCredentials  = opts.askForCredentials;
}

Frontend.prototype.extractCredentials = function(req) {
	return this._extractCredentials(req);
};

Frontend.prototype.askForCredentials = function(res) {
	return this._askForCredentials(res);
};

module.exports = Frontend;
