function AuthFrontend(opts) {
	if (!(opts.extractCredentials && opts.askForCredentials))
		throw new Error;
	this.extractCredentials = opts.extractCredentials;
	this.askForCredentials  = opts.askForCredentials;
}

module.exports = AuthFrontend;
