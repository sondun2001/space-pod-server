var path = require('path');
var architect = require("architect");
var winston = require('winston');

var configPath = path.join(__dirname, "architect_config.js");
var config = architect.loadConfig(configPath);

// TODO: Need some configurable console logger (dev/prod)
// We will log normal api operations into api.log
console.log("Starting logger...");
winston.add(winston.transports.File, {
  filename: './logs/api.log'
});
// We will log all uncaught exceptions into exceptions.log
winston.handleExceptions(new winston.transports.File({
	filename: './logs/exceptions.log'
}));

architect.createApp(config, function (err, app) {
    if (err) throw err;
    
    // All plugins have been loaded!
    console.log("API Server Is Ready!");
    
    var sim = app.services.sim;
    if (sim != null) {
       sim.start();
    }
});