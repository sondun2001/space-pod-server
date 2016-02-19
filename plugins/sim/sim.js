module.exports = function setup(options, imports, register) {
    var gameloop = require('node-gameloop');
    var async = require('async');
    var CLI = require('clui');
    var Gauge = CLI.Gauge;
    var fps = 10;
    var loopId;
    var stateInBuffer;
    var stateOutBuffer = {};
    
    var server = imports.server;
    var auth = imports.auth;
    
    var simController = require('./controllers/sim.js');
    var SerialController = require('./controllers/serial.js');
    var serialController = null;
    
    var _lastSerialSent = 0;
    var _lastConsolePrint = 0;
    var SEND_SERIAL_INTERVAL = 0.2;
    var PRINT_CONSOLE_INTERVAL = 1;
    
    // var UI = require('./controllers/ui.js');
    
    // REST API
    
    // SOCKETS
    
    /*
    // stop the loop 2 seconds later 
    setTimeout(function() {
        console.log('2000ms passed, stopping the game loop');
        gameloop.clearGameLoop(id);
    }, 2000);
    */
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
                        // `delta` is the delta time from the last frame 
                        // console.log('(delta=%s)', delta);
                        
                        // Attempt to reconnect if disconnected
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
            var fl = simController.simState.fuelLevel;
            var al = simController.simState.auxLevel;
            var wl = simController.simState.waterLevel;
            var ol = simController.simState.oxygenLevel;
            
            stateOutBuffer.ep = simController.simState.enginePower;
            stateOutBuffer.fl = Number(fl.toFixed(2));
            stateOutBuffer.al = Number(al.toFixed(2));
            stateOutBuffer.wl = Number(wl.toFixed(2));
            stateOutBuffer.ol = Number(ol.toFixed(2));
            stateOutBuffer.wf = simController.simState.warningFlags;
            stateOutBuffer.cr = Math.round(simController.battery.getChargeRate());
            stateOutBuffer.dr = Math.round(simController.battery.getDrainRate());
            //console.log(JSON.stringify(stateOutBuffer));
            
            serialController.send(JSON.stringify(stateOutBuffer) + "\0");
            _lastSerialSent = 0;
        }
    }
    
    function printToConsole(delta) {
        _lastConsolePrint += delta;
        if (_lastConsolePrint + delta > PRINT_CONSOLE_INTERVAL) {
            console.log('\033[2J');
            console.log("  Engine:  " + Gauge(stateOutBuffer.ep, 1, 20, 1));
            console.log("  ");
            console.log("  Fuel:    " + Gauge(stateOutBuffer.fl, 1, 20, 1));
            console.log("  Battery: " + Gauge(stateOutBuffer.al, 1, 20, 1));
            console.log("  Water:   " + Gauge(stateOutBuffer.wl, 1, 20, 1));
            console.log("  Oxygen:  " + Gauge(stateOutBuffer.ol, 1, 20, 1));
            console.log("  ");
            
            // UI.render(simController);
            
            // TODO: Move to another function, but for now can share this one since the time is aligned
            serialController.connect(null, handleSerialData);
            _lastConsolePrint = 0;
        }
    }
}