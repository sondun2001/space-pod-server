var checkFuelLine = false;
var systemCheckLapse = 0;

module.exports.checkFuelLine = function() {
    return checkFuelLine;
}

module.exports.demandFuel = function(simState, demand, delta) {
    systemCheckLapse += delta;
    
    var fuelInput = demand;
    if (simState.fuelLevel - demand < 0) {
        fuelInput = simState.fuelLevel;
    }
    
    // Can't obtain fuel to issue with fuel line!
    if (checkFuelLine || (systemCheckLapse > 60 && Math.random() * 100 < 0.01)) {
       checkFuelLine = true;
       fuelInput = 0;
       systemCheckLapse = 0;
    }
    
    simState.fuelLevel -= fuelInput;
    return fuelInput;
}