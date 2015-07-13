module.exports = exports = require('./authority').create;

exports.identify = require('./middleware/identify');
exports.requirePrivilege = require('./middleware/requirePrivilege');
