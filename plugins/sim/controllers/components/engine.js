// ENGINE / ROCKET
var settings = require("nconf");
var Sound = require('../sound.js').Sound;
var fuelSystem = require('./fuelSystem');
var battery = require('./battery');

var FUEL_BURN_RATE = settings.get("sim:fuel_burn_rate");

var powerInput = 0;

var engineSound = new Sound('rocket.mp3');
engineSound.on('end',function(item) {
    setTimeout(function () {
        engineSound.play();
    }, 0);
});

module.exports.setPower = function(input) {
    powerInput = input;
}

module.exports.process = function(simState, delta) {
    var enginePowerFuelDemand = Math.pow(powerInput, 3) * FUEL_BURN_RATE * delta;
    
    // Obtain FUEL
    var fuelInput = fuelSystem.demandFuel(simState, enginePowerFuelDemand, delta);
    simState.enginePower = (enginePowerFuelDemand == 0) ? 0 : powerInput * (fuelInput / enginePowerFuelDemand);
    
    // TODO: Lerp engine power
    
    // Engine Sound
    if (simState.enginePower > 0) {
        if (!engineSound.isPlaying()) engineSound.play();
        engineSound.setVolume(simState.enginePower);
    } else if (simState.enginePower == 0 && engineSound.isPlaying()) {
        engineSound.stop();
    }
    // Calculate Thrust?
    // https://www.grc.nasa.gov/www/k-12/airplane/thrsteq.html
}