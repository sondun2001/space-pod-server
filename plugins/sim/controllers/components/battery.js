var averageCharge = 0;
var averageDrain = 0;

module.exports.getChargeRate = function() {
    return averageCharge;
}

module.exports.getDrainRate = function() {
    return averageDrain;
}

module.exports.charge = function(simState, power, delta) {
    averageCharge = ((averageCharge + power) * 0.5);
    simState.auxLevel += power * delta;
    if (simState.auxLevel > 1) simState.auxLevel = 1;
}

module.exports.drain = function(simState, power, delta) {
    averageDrain = ((averageDrain + power) * 0.5);
    var powerInput = power * delta;
    if (simState.auxLevel - powerInput < 0) {
        powerInput = simState.auxLevel;
    }
    
    simState.auxLevel -= powerInput;
    return powerInput;
}