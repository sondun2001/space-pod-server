var battery = require('./battery');
var simController = require('../sim');

var _atmosphereUVFilter = 0.5; // TODO: Change this value when landing on planets, 1 = No atmpospheric filter of UV, 0 = No sunshine

module.exports.setPanelEfficiency = function(efficiency) {
    _atmosphereUVFilter = efficiency;
}

module.exports.getNumPanels = function() {
    return simController.spacePod.numPanels;
}

module.exports.setNumPanels = function(num) {
    simController.spacePod.numPanels = num;
}

module.exports.process = function(simState, spacePod, delta) {
    var power = spacePod.panelWattage * spacePod.numPanels * _atmosphereUVFilter;
    battery.charge(simState, power, delta);
}