var battery = require('./battery');
var _checkFuelLine = false;
var _systemCheckLapse = 0;

module.exports.checkFuelLine = function() {
    return _checkFuelLine;
}

module.exports.demandFuel = function(simState, demand, delta) {
    // Electricity required to pump fuel
    battery.drain(simState, 20, delta);
    
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