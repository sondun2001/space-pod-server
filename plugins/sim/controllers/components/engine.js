// ENGINE / ROCKET
var settings = require("nconf");
var Sound = require('../sound.js').Sound;
var fuelSystem = require('./fuelSystem');
var battery = require('./battery');

var FUEL_BURN_RATE = settings.get("sim:fuel_burn_rate");

var _powerInput = 1;
var _targetEnginePower = 0;
var _enginePowerTime = 0;

var engineSound = new Sound('rocket.mp3');
engineSound.on('end',function(item) {
    engineSound.play();
});

module.exports.setPower = function(input) {
    _powerInput = input;
}

module.exports.process = function(simState, delta) {
    if (_powerInput == 0) return;
    
    var enginePowerFuelDemand = Math.pow(_powerInput, 3) * FUEL_BURN_RATE * delta;
    
    // Obtain FUEL
    var fuelInput = fuelSystem.demandFuel(simState, enginePowerFuelDemand, delta);
    var targetEnginePower = (enginePowerFuelDemand == 0) ? 0 : _powerInput * (fuelInput / enginePowerFuelDemand);
    
    if (targetEnginePower != _targetEnginePower) {
        _targetEnginePower = targetEnginePower;
        _enginePowerTime = 0;
    }
    
    if (simState.enginePower != _targetEnginePower) {
        var percent = _enginePowerTime / 10;
        if (percent < 0) { percent = 0; } else if (percent > 1) { percent = 1; }
        simState.enginePower = _targetEnginePower * percent;
        _enginePowerTime += delta;
    }
    
    if (simState.enginePower > 0) {
        if (!engineSound.isPlaying()) engineSound.play();
        engineSound.setVolume(simState.enginePower);
        
        // Charge battery when engine is on
        battery.charge(simState, 10 * simState.enginePower, delta);
    } else if (simState.enginePower == 0 && engineSound.isPlaying()) {
        engineSound.stop();
    }
    
    // Calculate Thrust?
    // https://www.grc.nasa.gov/www/k-12/airplane/thrsteq.html
}