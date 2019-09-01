module.exports = function setup(options, imports, register) {
    var path = require('path');
    var nconf = require('nconf');
    nconf.argv().env();
    
    // Check environment specific spec
    // TODO: Use options to grab environment var
    var configPath = path.join(__dirname, process.env.NODE_ENV + '.json');
    nconf.file('environment', configPath);
    
    configPath = path.join(__dirname, 'defaults.json');
    nconf.file('defaults', configPath);
     
    console.log("Registering Config: " + process.env.NODE_ENV);
    register(null, {
        config: {
            get: function (key) {
                return nconf.get(key);
            }
        }
    });
}