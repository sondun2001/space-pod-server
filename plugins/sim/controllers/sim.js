var _ = require('underscore');
var settings = require('nconf');
var async = require('async');
var settings = require('nconf');

// SPACE POD COMPONENTS
var warningSystem = require('./components/warningSystem.js');
var engine = require('./components/engine.js');

// SIM CONSTANTS
var TARGET_OXYGEN = 21;
var TARGET_CABIN_PRESSURE = 14;

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
        oxygenLevel: TARGET_OXYGEN, // Low is under 19.5, enriched is higher than 23.5
        cabinPressure: TARGET_CABIN_PRESSURE, // Per square inch
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
    
    // Engine power
    if (data.hasOwnProperty("epi")) {
        engine.setPower(data.epi);
    }
    
    // console.log("Incoming: " + JSON.stringify(data));
    // Override any properties in sim with incoming data
    if (simState) {
        for (var attrname in data) { 
            if (simState.hasOwnProperty(attrname)) simState[attrname] = data[attrname]; 
        }
    }
}

exports.process = function (delta) {
    if (!simState) return;
    
    // If state=="LAUNCH"
        // Run Engine
            // Use Fuel
            // Did something go wrong?
    
    // If O2 < 21 Generate Oxygen and subtract power
    // If pressure low, Pressurize Cabin and subtract power
    engine.process(simState, delta);
    warningSystem.process(simState, delta);
    
    console.log(JSON.stringify(simState));
}