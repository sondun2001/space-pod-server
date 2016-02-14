// ENGINE / ROCKET
var settings = require("nconf");
var fuelSystem = require("./fuelSystem");

var FUEL_BURN_RATE = settings.get("sim:fuel_burn_rate");

exports.powerInput = 0.0;

exports.setPower = function(powerInput) {
    this.powerInput = powerInput;
}

exports.process = function(simState, delta) {
    var enginePowerFuelDemand = Math.pow(this.powerInput, 3) * FUEL_BURN_RATE * delta;
    
    // Obtain FUEL
    var fuelInput = fuelSystem.demandFuel(simState, enginePowerFuelDemand);
    simState.enginePower = (enginePowerFuelDemand == 0) ? 0 : this.powerInput * (fuelInput / enginePowerFuelDemand);
    
    // Calculate Thrust?
    // https://www.grc.nasa.gov/www/k-12/airplane/thrsteq.html
}