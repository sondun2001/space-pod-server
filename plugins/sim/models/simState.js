var thinky = require('../../db/thinky.js');
var type = thinky.type;
var settings = require('nconf');

var SimState = thinky.createModel("SimState", {
    enginePower: type.number().default(0),
    fuelLevel: type.number().default(1),
    auxLevel: type.number().default(1),
    waterLevel: type.number().default(1),
    oxygenLevel: type.number().default(settings.get("sim:target_oxygen")),
    cabinPressure: type.number().default(settings.get("sim:target_pressure")),
    state: type.string().default("OFF"),
    warnings: type.number().default(0)
});

module.exports = SimState;