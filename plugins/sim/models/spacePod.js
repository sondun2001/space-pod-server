var thinky = require('../../db/thinky.js');
var type = thinky.type;
var settings = require('nconf');

var SpacePod = thinky.createModel("SpacePod", {
    numPanels: type.number().default(0),
    panelWattage: type.number().default(200),
    batteryCapacity: type.number().default(settings.get("sim:battery_watts"))
});

module.exports = SpacePod;