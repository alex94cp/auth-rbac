module.exports = exports = require('./autority').create;

exports.identify = require('./middleware/identify');
exports.requirePrivilege = require('./middleware/requirePrivilege');
