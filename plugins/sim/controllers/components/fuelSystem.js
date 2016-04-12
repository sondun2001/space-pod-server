var battery = require('./battery');
var _checkFuelLine = false;
var _systemCheckLapse = 0;
var _refueling = false;

// TODO: Have components be classes!

module.exports.checkFuelLine = function() {
    return _checkFuelLine;
}

module.exports.reset = function() {
    _checkFuelLine = false;
}

module.exports.refuel = function() {
    _refueling = true;
}

module.exports.stopRefuel = function() {
    _refueling = false;
}

module.exports.process = function(simState, delta) {
    if (_refueling) {
        simState.fuelLevel += 0.1 * delta;
        if (simState.fuelLevel > 1) {
            simState.fuelLevel = 1;
            _refueling = false;
        }
    }
}

module.exports.demandFuel = function(simState, demand, delta) {
    // Electricity required to pump fuel
    if (!battery.drain(simState, 20, delta)) return 0;
    
    _systemCheckLapse += delta;
    
    var fuelInput = demand;
    if (simState.fuelLevel - demand < 0) {
        fuelInput = simState.fuelLevel;
    }
    
    // Can't obtain fuel to issue with fuel line!
    if (_checkFuelLine || (_systemCheckLapse > 60 && Math.random() * 100 < 0.01)) {
       _checkFuelLine = true;
       fuelInput = 0;
       _systemCheckLapse = 0;
    }
    
    simState.fuelLevel -= fuelInput;
    return fuelInput;
}