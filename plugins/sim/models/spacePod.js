var thinky = require('../../db/thinky.js');
var type = thinky.type;

var SpacePod = thinky.createModel("SpacePod", {
    numPanels: type.number(),
    panelWattage: type.number(),
    panelEfficiency: type.number(),
    batteryCapacity: type.number()
});

module.exports = SpacePod;