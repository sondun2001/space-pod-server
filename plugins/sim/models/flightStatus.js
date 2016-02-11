var thinky = require('../../db/thinky.js');
var type = thinky.type;

var FlightStatus = thinky.createModel("FlightStatus", {
    history:[{
        enginePower: type.number(),
        fuelLevel: type.number(),
        auxLevel: type.number(),
        oxygenLevel: type.number(),
        cabinPressure: type.number(),
        state: type.string(),
        warnings: type.number()
    }],
    start: type.date(),
    end: type.date()
});

// TODO: Add method in model to end flight

module.exports = FlightStatus;