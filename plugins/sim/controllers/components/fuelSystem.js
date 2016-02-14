var checkFuelLine = false;

exports.checkFuelLine = function() {
    return checkFuelLine;
}

exports.demandFuel = function(simState, demand) {
    var fuelInput = demand;
    if (simState.fuelLevel - demand < 0) {
        fuelInput = simState.fuelLevel;
    }
    
    // Can't obtain fuel to issue with fuel line!
    if (checkFuelLine || Math.random() < 0.005) {
       checkFuelLine = true;
       fuelInput = 0;
    }
    
    simState.fuelLevel -= fuelInput;
    return fuelInput;
}