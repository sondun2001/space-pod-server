var settings = require('nconf');

var BATTERY_WATTS = settings.get("sim:battery_watts");

var _averageCharge = 0;
var _averageDrain = 0;

module.exports.getChargeRate = function() {
    return _averageCharge;
}

module.exports.getDrainRate = function() {
    return _averageDrain;
}

module.exports.charge = function(simState, power, delta) {
    _averageCharge = ((_averageCharge + power) * 0.5);
    var powerInput = power * delta;
    var powerPercent = powerInput / BATTERY_WATTS;
    simState.auxLevel += powerPercent;
    if (simState.auxLevel > 1) simState.auxLevel = 1;
}

module.exports.drain = function(simState, power, delta) {
    _averageDrain = ((_averageDrain + power) * 0.5);
    var powerInput = power * delta;
    var powerPercent = powerInput / BATTERY_WATTS;
    if (simState.auxLevel - powerPercent < 0) return false;
    simState.auxLevel -= powerPercent;
    return true;
}