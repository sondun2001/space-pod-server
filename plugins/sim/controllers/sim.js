var _ = require('underscore');
var settings = require('nconf');
var async = require('async');

// SIM CONSTANTS
var HULL_DAMAGE = 1; // 00000001
var AIR_LEAK = 2; // 00000010
var OXYGEN_LOW = 4; // 00000100
var FUEL_LOW = 8; // 00001000
var ENGINE_FAILURE = 16; // 00010000
var FUSE = 32; // 00100000
var COLLISION = 64; // 01000000

var FUEL_BURN_RATE = 0.0001;

var SimState = require('../models/simState');
var simState;

exports.init = function (callback) {
    // TODO: Find if sim state exists in DB
    simState = null;
    exports.simState = simState;
    
    var config = {
        enginePower: 0,
        fuelLevel: 1,
        auxLevel: 1,
        oxygenLevel: 21, // Low is under 19.5, enriched is higher than 23.5
        cabinPressure: 14, // Per square inch
        state: "OFF",
        warningFlags: 0
    }
    
    simState = new SimState(config);
    exports.simState = simState;
    
    if (callback != null) {
        callback(simState);
    }
}

exports.updateState = function (data) {
    if (data == undefined || data == null) return;
    
    // console.log("Incoming: " + JSON.stringify(data));
    // Override any properties in sim with incoming data
    if (simState) {
        for (var attrname in data) { simState[attrname] = data[attrname]; }
    }
}

exports.process = function (delta) {
    if (!simState) return;
    
    // Lets Sim It!
    
    console.log(JSON.stringify(simState));
}