var thinky = require('../../db/thinky.js');
var type = thinky.type;
var settings = require('nconf');

var SpacePod = thinky.createModel("SpacePod", {
    numPanels: type.number().default(2),
    panelsDeployed: type.boolean().default(false)
});

module.exports = SpacePod;