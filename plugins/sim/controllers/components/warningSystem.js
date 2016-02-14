// WARNING SYSTEM
var settings = require('nconf');
var fuelSystem = require('./fuelSystem');

// Warning Flags (use bitwise << 1, << 2, << 3, etc)
var HULL_DAMAGE = settings.get("warningFlags:hull_damage"); // 00000001
var CABIN_PRESSURE = settings.get("warningFlags:cabon_pressure"); // 00000010
var OXYGEN_LOW = settings.get("warningFlags:oxygen_low"); // 00000100
var FUEL_LOW = settings.get("warningFlags:fuel_low"); // 00001000
var ENGINE_MALFUNCTION = settings.get("warningFlags:engine_malfunction"); // 00010000
var FUSE = settings.get("warningFlags:fuse"); // 00100000
var COLLISION = settings.get("warningFlags:collision"); // 01000000
var FUEL_LINE = settings.get("warningFlags:fuel_line"); // 10000000

var FUEL_WARN_THRESHOLD = settings.get("sim:fuel_warn_threshold");

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

exports.process = function(simState, delta) {
    // Check Fuel
    if (simState.fuelLevel < FUEL_WARN_THRESHOLD)
    {
        simState.warningFlags |= FUEL_LOW;
    }
    else
    {
        simState.warningFlags &= ~FUEL_LOW;
    }
    
    if (fuelSystem.checkFuelLine()) {
        simState.warningFlags |= FUEL_LINE;
    }
    
    // Check Oxygen
}