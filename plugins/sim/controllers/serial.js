var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;

var arduinoSerialPort;
var serialData = "";
var isConnected = false;

exports.connect = function(connectHandler, receiveHandler) {
    // Already connected
    if (isConnected) return;
    
    // Automatically connect? 
    serialPort.list(function (err, ports) {
        ports.forEach(function(port) {
            console.log("comName: " + port.comName);
            console.log("pnpId: " + port.pnpId);
            console.log("manufacturer: " + port.manufacturer);
        });
    });
    
    arduinoSerialPort = new SerialPort("COM7", {
        baudrate: 9600,
        disconnectedCallback: onDisconnect
    }, false); // this is the openImmediately flag [default is true]
    
    // TODO: Could buffer on the Arduino before sending
    arduinoSerialPort.open(function (error) {
        if ( error ) {
            console.log('failed to open: '+error);
            isConnected = false;
        } else {
            console.log('Serial connection open');
            isConnected = true;
            if (connectHandler) connectHandler();
            arduinoSerialPort.on('data', function(data) {
                //console.log("Serial Data: " + data);
                serialData += data;
                // Check for eol \0 and check for string
                try {
                    var serialJson = JSON.parse(serialData);
                    if (serialJson) {
                        // console.log('data received: ' + JSON.stringify(serialJson));
                        // TODO: Pass json to another function
                        if (receiveHandler !== null) receiveHandler(serialJson);
                        serialData = "";
                    }
                } catch (error) {
                    // Not JSON yet
                }
            });
        }
    });
}

exports.send = function (message, callback) {
    if (!isConnected) {
        if (callback) callback('Not Connected', null);
        return;
    }
    arduinoSerialPort.write(message, callback);
}

function onDisconnect() {
    isConnected = false;
    console.log("Serial Connection Lost");
}

