module.exports = function setup(options, imports, register) {
    var gameloop = require('node-gameloop');
    var async = require('async');
    var fps = 10;
    var loopId;
    var stateInBuffer;
    var _stateOutBuffer = {};
    
    var server = imports.server;
    var auth = imports.auth;
    
    var simController = require('./controllers/sim.js');
    var SerialController = require('./controllers/serial.js');
    var serialController = null;
    
    var _lastSerialSent = 0;
    var _lastConsolePrint = 0;
    var SEND_SERIAL_INTERVAL = 0.2;
    var PRINT_CONSOLE_INTERVAL = 2;
    
    // var UI = require('./controllers/ui.js');
    
    // REST API
    
    // SOCKETS
    
    var router = server.router;
    
    // Reset the space pod!
    router.route('/reset')
    .get(function(req, res) {
        simController.init(function() {
            serialController.send("reset\0", function(err, results) {
                if (err) return res.status(500).json({error:err});
                return res.status(200).json({message:"Success!"});
            });
        })
    });
    
    function handleSerialData(data) {
        stateInBuffer = data;
    }
    
    // Init and register
    async.parallel([
        function(callback) {
             simController.init(function (simState) {
                callback(null, simState);
            });
        },
        function(callback) {
            serialController = new SerialController();
            serialController.connect(function(err) {
                callback(null, null);
            }, handleSerialData);
        }
    ],
    // optional callback
    function(err, results) {
        
        // Init the UI
        // UI.init();
        
        register(null, {
            sim: {
                start: function() {
                    // start the loop at configured framerate
                    loopId = gameloop.setGameLoop(function(delta) {
                        // `delta` is the delta time from the last frame in seconds
                        // console.log('(delta=%s)', delta);
                        
                        simController.updateState(stateInBuffer);
                        stateInBuffer = null;
                        simController.process(delta);
                        
                        printToSerial(delta);
                        printToConsole(delta);
                        
                    }, 1000 / fps);
                    
                    console.log("Starting Sim. loopId = " + loopId);
                },
                
                stop: function() {
                    gameloop.clearGameLoop(loopId);
                }
                
                // onDestroy ?
            }
        });
    });
    
    function printToSerial(delta) {
        if (!simController.simState) return;
        
        _lastSerialSent += delta;
        
        if (_lastSerialSent + delta > SEND_SERIAL_INTERVAL) {
            var ep = simController.simState.enginePower;
            var fl = simController.simState.fuelLevel;
            var al = simController.simState.auxLevel;
            var wl = simController.simState.waterLevel;
            var ol = simController.simState.oxygenLevel;
            
            _stateOutBuffer.ep = Number(ep.toFixed(2));
            _stateOutBuffer.fl = Number(fl.toFixed(2));
            _stateOutBuffer.al = Number(al.toFixed(2));
            _stateOutBuffer.wl = Number(wl.toFixed(2));
            _stateOutBuffer.ol = Number(ol.toFixed(2));
            _stateOutBuffer.wf = simController.simState.warningFlags;
            _stateOutBuffer.cr = Math.round(simController.battery.getChargeRate());
            _stateOutBuffer.dr = Math.round(simController.battery.getDrainRate());
            //console.log(JSON.stringify(_stateOutBuffer));
            
            serialController.send(JSON.stringify(_stateOutBuffer) + "\0");
            _lastSerialSent = 0;
        }
    }
    
    function printToConsole(delta) {
        _lastConsolePrint += delta;
        if (_lastConsolePrint + delta > PRINT_CONSOLE_INTERVAL) {
            console.log('\033[2J');
            console.log("  Engine:  " + (_stateOutBuffer.ep * 100) + "%");
            console.log("  ");
            console.log("  Fuel:    " + (_stateOutBuffer.fl * 100) + "%");
            console.log("  Battery: " + (_stateOutBuffer.al * 100) + "%");
            console.log("  Water:   " + (_stateOutBuffer.wl * 100) + "%");
            console.log("  Oxygen:  " + (_stateOutBuffer.ol * 100) + "%");
            console.log("  ");
            
            // UI.render(simController);
            
            // TODO: Move to another function, but for now can share this one since the time is aligned
            serialController.connect(null, handleSerialData);
            _lastConsolePrint = 0;
        }
    }
}