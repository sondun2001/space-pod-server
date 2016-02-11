module.exports = function setup(options, imports, register) {
    var gameloop = require('node-gameloop');
    var async = require('async');
    
    var fps = 1;
    var loopId;
    var stateInBuffer;
    var stateOutBuffer = {};
    
    var server = imports.server;
    var auth = imports.auth;
    
    var simController = require('./controllers/sim.js');
    var serialController = require('./controllers/serial.js');
    
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
        if (stateInBuffer) {
            console.warn("State buffer is not empty!")
        }
        stateInBuffer = data;
    }
    
    // Init and register
    async.parallel([
        function(callback){
             simController.init(function (simState) {
                callback(null, simState);
            });
        },
        function(callback){
            serialController.connect(function() {
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
                        // `delta` is the delta time from the last frame 
                        // console.log('(delta=%s)', delta);
                        
                        simController.updateState(stateInBuffer);
                        stateInBuffer = null;
                        simController.process(delta);
                        updateOutBuffer();
                        serialController.send(JSON.stringify(stateOutBuffer));
                        
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
    
    function updateOutBuffer() {
        if (!simController.simState) return;
        stateOutBuffer.fl = simController.simState.fuelLevel;
    }
}