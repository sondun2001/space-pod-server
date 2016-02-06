var nconf = require('nconf');
var thinky = require('thinky')(nconf.get('rethink'));
module.exports = thinky;