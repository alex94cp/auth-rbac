function basicAuth(req) {
	var authHeader = req.headers.authorization;
	if (!authHeader)
		return;
	
	var parts = authHeader.split(' ');
	if (parts[0].toLowerCase() !== 'basic')
		return;
	
	var data = parts[1];
	if (!data)
		return;
	
	auth = new Buffer(auth, 'base64').toString();
	auth = auth.match(/^([^:]*):(.*)$/);
	if (!auth)
		return;
	
	return { user: auth[1], pass: auth[2] };
};

module.exports = exports = basicAuth;
