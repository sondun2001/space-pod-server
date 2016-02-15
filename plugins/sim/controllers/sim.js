var _ = require('underscore');
var settings = require('nconf');
var async = require('async');
var settings = require('nconf');

// SPACE POD COMPONENTS
var components = require('./components');
var fuelSystem = components.FuelSystem;
var battery = components.Battery;
var engine = components.Engine;
var warningSystem = components.WarningSystem;
var solarPanels = components.SolarPanels;
var ECLSS = components.ECLSS;

var SimState = require('../models/simState');
var simState;

module.exports.battery = battery;
module.exports.init = function (callback) {
    // TODO: Find if sim state exists in DB
    simState = null;
    exports.simState = simState;
    
    var config = {
        enginePower: 0,
        fuelLevel: 1,
        auxLevel: 1,
        oxygenLevel: settings.get("sim:target_oxygen"),
        cabinPressure: settings.get("sim:target_pressure"),
        state: "OFF",
        warningFlags: 0
    }
    
    simState = new SimState(config);
    exports.simState = simState;
    
    if (callback != null) {
        callback(simState);
    }
}

module.exports.updateState = function (data) {
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

module.exports.process = function (delta) {
    if (!simState) return;
    
    // If state=="LAUNCH"
        // Run Engine
            // Use Fuel
            // Did something go wrong?
    
    // If pressure low, Pressurize Cabin and subtract power
    
    engine.process(simState, delta);
    warningSystem.process(simState, delta);
    solarPanels.process(simState, delta);
    ECLSS.process(simState, delta);
    //console.log(JSON.stringify(simState));
}