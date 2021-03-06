// WARNING SYSTEM
var settings = require('nconf');
var fuelSystem = require('./fuelSystem');
var battery = require('./battery');

// Warning Flags (use bitwise << 1, << 2, << 3, etc)
var HULL_DAMAGE = settings.get("warningFlags:hull_damage"); // 00000001
var CABIN_PRESSURE = settings.get("warningFlags:cabon_pressure"); // 00000010
var OXYGEN_LOW = settings.get("warningFlags:oxygen_low"); // 00000100
var FUEL_LOW = settings.get("warningFlags:fuel_low"); // 00001000
var ENGINE_MALFUNCTION = settings.get("warningFlags:engine_malfunction"); // 00010000
var BATTERY_HEALTH = settings.get("warningFlags:battery_health"); // 00100000
var COLLISION = settings.get("warningFlags:collision"); // 01000000
var FUEL_LINE = settings.get("warningFlags:fuel_line"); // 10000000

var BATTERY_LOW_THRESHOLD = settings.get("sim:battery_low_threshold");
var FUEL_LOW_THRESHOLD = settings.get("sim:fuel_low_threshold");
var OXYGEN_LOW_THRESHOLD = settings.get("sim:oxygen_low_threshold");
var OXYGEN_HIGH_THRESHOLD = settings.get("sim:oxygen_high_threshold");
/*
var mask = FLAG_B | FLAG_C; // 0010 | 0100 => 0110
if (flags & mask) { // 0101 & 0110 => 0100 => true
// do stuff
}
// Add Flag: flags |= mask;
// Clear Flag: 
var mask = ~(FLAG_A | FLAG_C); // ~0101 => 1010
flags &= mask;   // 1101 & 1010 => 1000
m_warningFlags &= ~FUEL_LOW
*/

if (settings.get("play_sound")) {
    var Sound = require('../sound.js').Sound;
    var _warningSound = new Sound('warning.mp3');
    _warningSound.on('end',function(item){
        _warningSound.play();
    });
}

module.exports.process = function(simState, delta) {
    
    // If not enough power, disable all warnings
    battery.drain(simState, 1, delta);
    
    // Check battery
    if (simState.auxLevel < BATTERY_LOW_THRESHOLD) {
        simState.warningFlags |= BATTERY_HEALTH;
    } else {
        simState.warningFlags &= ~BATTERY_HEALTH;
    }
    
    // Check Fuel
    if (simState.fuelLevel < FUEL_LOW_THRESHOLD) {
        simState.warningFlags |= FUEL_LOW;
    } else {
        simState.warningFlags &= ~FUEL_LOW;
    }
    
    // Check fuel line condition
    // TODO: Use event emitter instead of continuous check
    if (fuelSystem.checkFuelLine()) {
        simState.warningFlags |= FUEL_LINE;
    }
    
    // Check Oxygen
    if (simState.oxygenLevel < OXYGEN_LOW_THRESHOLD || simState.oxygenLevel > OXYGEN_HIGH_THRESHOLD) {
        simState.warningFlags |= OXYGEN_LOW;
    } else {
        simState.warningFlags &= ~OXYGEN_LOW;
    }
    
    if (_warningSound) {
        if (simState.warningFlags > 0 && !_warningSound.isPlaying()) {
            _warningSound.play();
        } else if (simState.warningFlags == 0 && _warningSound.isPlaying()) {
            _warningSound.stop();
        }
    }
}

module.exports.clearFlag = function(simState, flag) {
    simState.warningFlags &= ~flag;
}