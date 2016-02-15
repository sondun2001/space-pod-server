var thinky = require('../../db/thinky.js');
var type = thinky.type;

var SimState = thinky.createModel("SimState", {
    enginePower: type.number(),
    fuelLevel: type.number(),
    auxLevel: type.number(),
    oxygenLevel: type.number(),
    cabinPressure: type.number(),
    waterLevel: type.number(),
    state: type.string(),
    warnings: type.number()
});

module.exports = SimState;