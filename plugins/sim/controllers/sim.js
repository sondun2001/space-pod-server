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

// TODO: Remove this, expose all components
module.exports.battery = battery;

module.exports.components = components;

module.exports.init = function (reset, callback) {
    simState = null;
    spacePod = null;
    
    async.parallel([
        function(callback) {
             Models.SimState.run().then(function(states) {
                if (states && states.length > 0) {
                    simState = states[0];
                    
                    if (reset) {
                        simState.enginePower = 0;
                        simState.fuelLevel = 1;
                        simState.auxLevel = 1;
                        simState.waterLevel = 1;
                        simState.oxygenLevel = settings.get("sim:target_oxygen");
                        simState.cabinPressure = settings.get("sim:target_pressure");
                        simState.state = "OFF";
                        simState.warnings = 0;
                    }
                } else {
                    simState = new Models.SimState({});
                }
                
                simState.save(function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, simState);
                    }
                });
            }).error(function(err) {
                if (err) {
                    callback(err, null);
                }
            });
        },
        function(callback) {
            Models.SpacePod.run().then(function(pods) {
                if (pods && pods.length > 0) {
                    spacePod = pods[0];
                    
                    if (reset) {
                        spacePod.numPanels = 0;
                        spacePod.panelWattage = 200;
                        spacePod.batteryCapacity = settings.get("sim:battery_watts");
                    }
                } else {
                    spacePod = new Models.SpacePod({});
                }
                
                spacePod.save(function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, spacePod);
                    }
                });
            }).error(function(err) {
                if (err) {
                    callback(err, null);
                }
            });
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

module.exports.softReset = function() {
    module.exports.updatePod({numPanels: 1});
    module.exports.updateState({fuelLevel: 1, warnings: 0});
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
    
    simState.oxygenLevel -= 0.00001 * delta; // TODO: Multiply by number of occupants
    
    engine.process(simState, delta);
    warningSystem.process(simState, delta);
    solarPanels.process(simState, spacePod, delta);
    ECLSS.process(simState, delta);
    //console.log(JSON.stringify(simState));
}