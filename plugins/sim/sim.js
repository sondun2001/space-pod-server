module.exports = function setup(options, imports, register) {
    var gameloop = require('node-gameloop');
    var async = require('async');
    var fps = 15;
    var _loopId;
    var _serialInBuffer;
    var _stateOutBuffer = {};
    
    var server = imports.server;
    
    var simController = require('./controllers/sim.js');
    var SerialController = require('./controllers/serial.js');
    var serialController = null;
    
    var _lastSerialSent = 0;
    var _lastConsolePrint = 0;
    var SEND_SERIAL_INTERVAL = 0.2;
    var PRINT_CONSOLE_INTERVAL = 2;
    
    var UI = require('./controllers/ui.js');
    
    ///////////////////// Sockets /////////////////////
    
    var io = server.socket;
    
    io.on('connection', function (socket) {
        if (simController.simState) socket.emit('state', simController.simState);
        if (simController.spacePod) socket.emit('pod', simController.spacePod);
        
        socket.on('pod', function(data) {
            simController.updatePod(data);
        });
        
        socket.on('state', function(data) {
            simController.updateState(data);
        });
        
        socket.on('toggleLCD', function() {
            serialController.send("toggleLCD\0", function(err, results) {
            
            });
        });
        
        socket.on('reset', function() {
            resetSim();
        });
        
        socket.on('softReset', function() {
            simController.softReset();
        });
        
        socket.on('repairFuelLine', function() {
            simController.fuelSystem.reset();
        });
        
        socket.on('refuel', function() {
            simController.fuelSystem.refuel();
        });
        
        socket.on('stopRefuel', function() {
            simController.fuelSystem.stopRefuel();
        });

        socket.on('refuelWater', function() {
            simController.ECLSS.refuel();
        });
        
        socket.on('deployPanels', function() {
            //simController.solarPanels.setNumPanels(1);
            simController.spacePod.panelsDeployed = !simController.spacePod.panelsDeployed;
            simController.updatePod(simController.spacePod);
            socket.emit('pod', simController.spacePod);
        });
        
        socket.on('clearFlag', function(flag) {
            simController.warningSystem.clearFlag(simController.simState, flag);
        });
        
        socket.on('setEnginePower', function(power) {
            simController.setEnginePower(power);
        });
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
    })
    .post(function(req, res) {
        simController.updateState(req.body, function(state) {
            return res.status(200).json(simController.simState);
        })
    })
    
    router.route('/pod')
    .get(function(req, res) {
        simController.updatePod(req.body, function(pod) {
            return res.status(200).json(simController.spacePod);
        })
    })
    .post(function(req, res) {
        for (var attrname in req.body) { simController.spacePod[attrname] = req.body[attrname]; }
        return res.status(200).json(simController.spacePod);
    })
    
    router.route('/softReset')
    .get(function(req, res) {
        simController.softReset();
        return res.status(200).json({state: simController.simState, pod:simController.spacePod});
    });
    
    router.route('/stop')
    .get(function(req, res) {
        stopSim();
        return res.status(200).send('Sim Stopped');
    });
    
    router.route('/start')
    .get(function(req, res) {
        startSim();
        return res.status(200).send('Sim Started');
    });
    
    router.route('/refuel')
    .get(function(req, res) {
        simController.fuelSystem.refuel();
        return res.status(200).send('Refueling...');
    });
    
    ///////////////////// Init /////////////////////
    
    async.parallel([
        function(callback) {
             simController.init(false, function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, true);
                }
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
        if (err) {
            return console.error(err);
        }
        
        if (simController.simState) io.sockets.emit('state', simController.simState);
        if (simController.spacePod) io.sockets.emit('pod', simController.spacePod);
        
        console.log("Registering Sim");
        register(null, {
            sim: {
                start: function() {
                    startSim();
                    
                    // Init the UI
                    UI.init();
                },
                
                stop: function() {
                    stopSim();
                }
                
                // onDestroy ?
            }
        });
    });
    
    function stopSim() {
        gameloop.clearGameLoop(_loopId);
    }
    
    function startSim() {
        // start the loop at configured framerate
        _loopId = gameloop.setGameLoop(function(delta) {
            // `delta` is the delta time from the last frame in seconds
            // console.log('(delta=%s)', delta);
            
            processSerialData();
            simController.process(delta);
            printToSerial(delta);
            printToConsole(delta);
            
        }, 1000 / fps);
        
        console.log("Starting Sim. _loopId = " + _loopId);
    }
    
    ///////////////////// Supporting Methods /////////////////////
    
    function resetSim(callback) {
        simController.init(true, function(err) {
            if (callback) callback(err);
            /*
            serialController.send("reset\0", function(err, results) {
            });
            */
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
            
            io.sockets.emit('state', simController.simState);
            
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