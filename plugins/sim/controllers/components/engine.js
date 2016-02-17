// ENGINE / ROCKET
var settings = require("nconf");
var fuelSystem = require('./fuelSystem');
var battery = require('./battery');

var FUEL_BURN_RATE = settings.get("sim:fuel_burn_rate");

var powerInput = 0.0;

module.exports.setPower = function(input) {
    powerInput = input;
}

module.exports.process = function(simState, delta) {
    var enginePowerFuelDemand = Math.pow(powerInput, 3) * FUEL_BURN_RATE * delta;
    
    // Obtain FUEL
    var fuelInput = fuelSystem.demandFuel(simState, enginePowerFuelDemand, delta);
    simState.enginePower = (enginePowerFuelDemand == 0) ? 0 : powerInput * (fuelInput / enginePowerFuelDemand);
    
    // Calculate Thrust?
    // https://www.grc.nasa.gov/www/k-12/airplane/thrsteq.html
}