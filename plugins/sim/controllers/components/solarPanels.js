var battery = require('./battery');

var _atmosphereUVFilter = 1; // TODO: Change this value when landing on planets, 1 = No atmpospheric filter of UV, 0 = No sunshine
var _numPanels = 0;
var _panelPowerRating = 200;

module.exports.setPanelEfficiency = function(efficiency) {
    _atmosphereUVFilter = efficiency;
}

module.exports.getNumPanels = function() {
    return _numPanels;
}

module.exports.setNumPanels = function(num) {
    _numPanels = num;
}

module.exports.process = function(simState, delta) {
    var power = _panelPowerRating * _numPanels * _atmosphereUVFilter;
    battery.charge(simState, power, delta);
}