var battery = require('./battery');

var atmosphereUVFilter = 1; // TODO: Change this value when landing on planets, 1 = No atmpospheric filter of UV, 0 = No sunshine
var numPanels = 0;
var panelEfficiency = 0.40; // Allow up to .5 efficiency
var outputPerPanel = 200;

module.exports.process = function(simState, delta) {
    var power = outputPerPanel * numPanels * panelEfficiency * atmosphereUVFilter;
    battery.charge(simState, power, delta);
}