var _ = require('underscore');
var settings = require('nconf');
var async = require('async');
//var soundController = require('./sound');

// SPACE POD COMPONENTS
var components = require('./components');
var fuelSystem = components.FuelSystem;
var battery = components.Battery;
var engine = components.Engine;
var warningSystem = components.WarningSystem;
var solarPanels = components.SolarPanels;
var ECLSS = components.ECLSS;

var simState = null;
var spacePod = null;

// TODO: Remove this, expose all components
module.exports.battery = battery;
module.exports.fuelSystem = fuelSystem;
module.exports.ECLSS = ECLSS;
module.exports.warningSystem = warningSystem;
module.exports.solarPanels = solarPanels;

module.exports.init = function (reset, callback) {
    simState = null;
    spacePod = null;
    
    async.parallel([
        function(callback) {
            simState = {};
            simState.enginePower = 0;
            simState.fuelLevel = 1;
            simState.auxLevel = 1;
            simState.waterLevel = 1;
            simState.oxygenLevel = settings.get("sim:target_oxygen");
            simState.cabinPressure = settings.get("sim:target_pressure");
            simState.state = "OFF";
            simState.warningFlags = 0;
            
            // Reset systems
            fuelSystem.reset();
            
            callback(null, simState);
        },
        function(callback) {
            spacePod = {}; 
            spacePod.numPanels = 2;
            callback(null, spacePod);
        }
    ],
    // optional callback
    function(err, results) {
        if (err) {
            return callback(err);
        }
        
        simState = results[0];
        spacePod = results[1];
        
        exports.simState = simState;
        exports.spacePod = spacePod;
        
        callback();
    });
}

module.exports.updatePod = function(data, callback) {
    if (spacePod) {
        for (var attrname in data) { 
            spacePod[attrname] = data[attrname]; 
        }
        
        if (callback != null) callback(spacePod);
    }
}

module.exports.updateState = function (data, callback) {
    if (data == undefined || data == null) return;
    
    console.log("Incoming: " + JSON.stringify(data));
    // Override any properties in sim with incoming data
    if (simState) {
        for (var attrname in data) { 
            simState[attrname] = data[attrname]; 
        }
        
        if (callback != null) callback(simState);
    }
}

module.exports.softReset = function() {
    module.exports.updatePod({numPanels: 2, panelsDeployed:false});
    module.exports.updateState({fuelLevel: 1, auxLevel:1, waterLevel:1, warningFlags: 0});
    fuelSystem.reset();
}

module.exports.setEnginePower = function (power) {
    engine.setPower(power);
}

module.exports.process = function (delta) {
    if (!simState) return;
    
    // If state=="LAUNCH"
        // Run Engine
            // Use Fuel
            // Did something go wrong?
    
    // TODO: Take into account occupants
    simState.oxygenLevel -= 0.0005 * delta;

    engine.process(simState, spacePod, delta);
    fuelSystem.process(simState, delta);
    warningSystem.process(simState, delta);
    solarPanels.process(simState, spacePod, delta);
    ECLSS.process(simState, delta);

    // Cap O2 depletion
    if (simState.oxygenLevel < 0)
        simState.oxygenLevel = 0;

    //console.log(JSON.stringify(simState));
}