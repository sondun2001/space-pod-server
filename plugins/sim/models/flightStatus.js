var thinky = require('../../db/thinky.js');
var type = thinky.type;

var FlightStatus = thinky.createModel("FlightStatus", {
    history:[],
    start: type.date(),
    end: type.date()
});

module.exports = FlightStatus;