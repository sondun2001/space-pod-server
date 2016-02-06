module.exports = function setup(options, imports, register) {
    var thinky = require('./thinky');

    register(null, {
        database: {
            thinky: thinky
        }
    });
}