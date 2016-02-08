module.exports = function setup(options, imports, register) {
    var gameloop = require('node-gameloop');
    var fps = 1;
    var loopId;
    
    var server = imports.server;
    var auth = imports.auth;
    
    // REST API
    
    // SOCKETS
    
    // SIM CONSTANTS
    var HULL_DAMAGE = 1; // 00000001
    var AIR_LEAK = 2; // 00000010
    var OXYGEN_LOW = 4; // 00000100
    var FUEL_LOW = 8; // 00001000
    var ENGINE_FAILURE = 16; // 00010000
    var FUSE = 32; // 00100000
    var COLLISION = 64; // 01000000

    // SIM VARS
    var enginePower = 0;
    var fuelLevel = 1;
    var auxLevel = 1;
    var oxygen = .28;
    
    var warningFlags = 0;
    
    /*
    var mask = FLAG_B | FLAG_C; // 0010 | 0100 => 0110
    if (flags & mask) { // 0101 & 0110 => 0100 => true
        // do stuff
    }
    warningFlags = HULL_DAMAGE | OXYGEN_LOW;
    console.log(warningFlags);
    */
    
    /*
    // stop the loop 2 seconds later 
    setTimeout(function() {
        console.log('2000ms passed, stopping the game loop');
        gameloop.clearGameLoop(id);
    }, 2000);
    */
    
    var serialPort = require("serialport");
    serialPort.list(function (err, ports) {
        ports.forEach(function(port) {
            console.log(port.comName);
            console.log(port.pnpId);
            console.log(port.manufacturer);
        });
    });

    var SerialPort = serialPort.SerialPort;
    var arduinoSerialPort = new SerialPort("COM7", {
        baudrate: 9600
    }, false); // this is the openImmediately flag [default is true]

    // TODO: Could buffer on the Arduino before sending
    var serialData = "";
    arduinoSerialPort.open(function (error) {
        if ( error ) {
            console.log('failed to open: '+error);
        } else {
            console.log('open');
            arduinoSerialPort.on('data', function(data) {
                serialData += data;
                try {
                    var serialJson = JSON.parse(serialData);
                    if (serialJson) {
                        // console.log('data received: ' + JSON.stringify(serialJson));
                        // TODO: Pass json to another function
                        handleSerialData(serialJson);
                        serialData = "";
                    }
                } catch (error) {
                    
                }
            });
            /*
            arduinoSerialPort.write("ls\n", function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
            });
            */
        }
    });
    
    function handleSerialData(data) {
        enginePower = data.ep;
    }

    var router = server.router;
    
    // Reset the space pod!
    router.route('/reset')
    .get(function(req, res) {
        arduinoSerialPort.write("reset\n", function(err, results) {
            if (err) return res.status(500).json({error:err});
            return res.status(200).json({message:"Success!"});
        });
    });
    
    register(null, {
        sim: {
            start: function() {
                // start the loop at configured framerate
                loopId = gameloop.setGameLoop(function(delta) {
                    // `delta` is the delta time from the last frame 
                    // console.log('(delta=%s)', delta);
                    // TODO: Simulate Fuel, etc
                }, 1000 / fps);
                
                console.log("Starting Sim. loopId = " + loopId);
            },
            
            stop: function() {
                gameloop.clearGameLoop(loopId);
            }
            
            // onDestroy ?
        }
    });
}