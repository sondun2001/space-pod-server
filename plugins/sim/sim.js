module.exports = function setup(options, imports, register) {
    var gameloop = require('node-gameloop');
    var async = require('async');
    var fps = 15;
    var loopId;
    var _serialInBuffer;
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
    
    var UI = require('./controllers/ui.js');
    
    ///////////////////// Sockets /////////////////////
    
    var socket = server.socket;
    socket.on('spacePod', function(data) {
        simController.updatePod(data);
    });
    
    socket.on('simState', function(data) {
        simController.updateState(data);
    });
    
    socket.on('toggleLCD', function() {
        console.log("toggleLCD");
        serialController.send("toggleLCD\0", function(err, results) {
           
        });
    });
    
    socket.on('reset', function() {
        resetSim();
    });
    
    ///////////////////// REST API /////////////////////
    
    var router = server.router;
    
    router.route('/reset')
    .get(function(req, res) {
        resetSim(function(err, results) {
            if (err) return res.status(500).json({error:err});
            return res.status(200).json({message:"Success!"});
        })
    });
    
    router.route('/state')
    .get(function(req, res) {
        return res.status(200).json(simController.simState);
    });
    
    router.route('/spacePod')
    .get(function(req, res) {
        return res.status(200).json(simController.spacePod);
    });
    
    ///////////////////// Init /////////////////////
    
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
        register(null, {
            sim: {
                start: function() {
                    // start the loop at configured framerate
                    loopId = gameloop.setGameLoop(function(delta) {
                        // `delta` is the delta time from the last frame in seconds
                        // console.log('(delta=%s)', delta);
                        
                        processSerialData();
                        simController.process(delta);
                        printToSerial(delta);
                        printToConsole(delta);
                        
                    }, 1000 / fps);
                    
                    console.log("Starting Sim. loopId = " + loopId);
                    
                    // Init the UI
                    UI.init();
                },
                
                stop: function() {
                    gameloop.clearGameLoop(loopId);
                }
                
                // onDestroy ?
            }
        });
    });
    
    ///////////////////// Supporting Methods /////////////////////
    
    function resetSim(callback) {
        simController.init(function() {
            serialController.send("reset\0", function(err, results) {
                if (callback) callback(err, results);
            });
        })
    }
    
    function handleSerialData(data) {
        _serialInBuffer = data;
    }
    
    function processSerialData() {
        
        // Engine power
        if (_serialInBuffer) {
            if (_serialInBuffer.hasOwnProperty("epi")) {
                simController.setEnginePower(_serialInBuffer.epi);
            }
        }
        
        _serialInBuffer = null;
    }
    
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
            
            UI.setData(_stateOutBuffer);
            
            // TODO: Move to another function, but for now can share this one since the time is aligned
            serialController.connect(null, handleSerialData);
            _lastConsolePrint = 0;
        }
    }
}