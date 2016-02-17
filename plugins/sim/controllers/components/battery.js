var settings = require('nconf');
var averageCharge = 0;
var averageDrain = 0;
var battery_watts = settings.get("sim:battery_watts");

module.exports.getChargeRate = function() {
    return averageCharge;
}

module.exports.getDrainRate = function() {
    return averageDrain;
}

module.exports.charge = function(simState, power, delta) {
    averageCharge = ((averageCharge + power) * 0.5);
    var powerInput = power * delta;
    var powerPercent = powerInput / battery_watts;
    simState.auxLevel += powerPercent;
    if (simState.auxLevel > 1) simState.auxLevel = 1;
}

module.exports.drain = function(simState, power, delta) {
    averageDrain = ((averageDrain + power) * 0.5);
    var powerInput = power * delta;
    var powerPercent = powerInput / battery_watts;
    if (simState.auxLevel - powerPercent < 0) return false;
    simState.auxLevel -= powerPercent;
    return true;
}