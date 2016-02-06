module.exports = function setup(options, imports, register) {
    var gameloop = require('node-gameloop');
    var fps = 1;
    var loopId;
    
    var server = imports.server;
    var auth = imports.auth;
    
    // REST API
    
    // SOCKETS
    
    // SIM CONSTANTS
    var HULL_A = 1; // 0001
    var HULL_B = 2; // 0010
    var HULL_C = 4; // 0100
    var HULL_D = 8; // 1000

    // SIM VARS
    var enginePower = 0;
    var fuelLevel = 1;
    var auxLevel = 1;
    var oxygen = .28;
    var hullDamage = 0;
    
    /*
    var mask = FLAG_B | FLAG_C; // 0010 | 0100 => 0110
    if (flags & mask) { // 0101 & 0110 => 0100 => true
        // do stuff
    }
    */
    hullDamage = HULL_A | HULL_B;
    console.log(hullDamage);
    
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
        baudrate: 57600
    }, false); // this is the openImmediately flag [default is true]

    arduinoSerialPort.open(function (error) {
        if ( error ) {
            console.log('failed to open: '+error);
        } else {
            console.log('open');
            arduinoSerialPort.on('data', function(data) {
                console.log('data received: ' + data);
            });
            arduinoSerialPort.write("ls\n", function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
            });
        }
    });

    /*
    var serialPort = new SerialPort("/dev/tty-usbserial1", {
        baudrate: 57600
    });
    */
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