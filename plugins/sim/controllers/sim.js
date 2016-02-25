var _ = require('underscore');
var settings = require('nconf');
var async = require('async');
var settings = require('nconf');
var soundController = require('./sound');

// SPACE POD COMPONENTS
var components = require('./components');
var fuelSystem = components.FuelSystem;
var battery = components.Battery;
var engine = components.Engine;
var warningSystem = components.WarningSystem;
var solarPanels = components.SolarPanels;
var ECLSS = components.ECLSS;

var Models = require('../models/all.js');

var simState = null;
var spacePod = null;

module.exports.battery = battery;
module.exports.init = function (callback) {
    simState = null;
    spacePod = null;
    
    // TODO: Use ASYNC flow to get state and pod, or create new one
    Models.SimState.run().then(function(states) {
        if (states && states.length > 0) {
            simState = states[0];
        } else {
            simState = new Models.SimState({});
            simState.save(function(err) {
                if (!err) {
                    if (callback != null) callback(simState);
                }
            });
        }
        if (callback != null) callback(simState);
        exports.simState = simState;
    }).error(function(err) {
        if (err) {
            console.error(err);
        }
    });
    
    exports.spacePod = spacePod;
}

module.exports.updatePod = function(data, callback) {
    if (spacePod) {
        for (var attrname in data) { 
            if (spacePod.hasOwnProperty(attrname)) spacePod[attrname] = data[attrname]; 
        }
        
        spacePod.save(function(err) {
            if (!err) {
                if (callback != null) callback(spacePod);
            }
        });
    }
}

module.exports.updateState = function (data, callback) {
    if (data == undefined || data == null) return;
    
    // console.log("Incoming: " + JSON.stringify(data));
    // Override any properties in sim with incoming data
    if (simState) {
        for (var attrname in data) { 
            if (simState.hasOwnProperty(attrname)) simState[attrname] = data[attrname]; 
        }
        
        simState.save(function(err) {
            if (!err) {
                if (callback != null) callback(simState);
            }
        });
    }
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
    
    simState.oxygenLevel -= 0.00001 * delta; // TODO: Multiply by number of occupants
    
    engine.process(simState, delta);
    warningSystem.process(simState, delta);
    solarPanels.process(simState, delta);
    ECLSS.process(simState, delta);
    //console.log(JSON.stringify(simState));
}