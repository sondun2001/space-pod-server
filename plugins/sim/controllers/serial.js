var settings = require('nconf');
var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;

var SerialConnection = function() {
    this._arduinoSerialPort = null;
    this._serialData = "";
    this._isConnected = false;
    this._isConnecting = false;
    this._onConnect = null;
    this._onReceive = null;
    
    function onDisconnect() {
        this._isConnected = false;
        this._isConnecting = false;
        console.log("Serial Connection Lost");
    }
}

SerialConnection.prototype.findPort = function (callback) {
    // Automatically connect if no port name specified in config
    var portToConnect = settings.get('serial_port');
    if (portToConnect == "") {
        // Keep checking for a port if not connected
        serialPort.list(function (err, ports) {
            ports.forEach(function(port) {
                portToConnect = port.comName;
                console.log("comName: " + port.comName);
                /*
                console.log("pnpId: " + port.pnpId);
                console.log("manufacturer: " + port.manufacturer);
                */
            });
            
            // Present option to select which port
            callback(portToConnect);
        });
    } else {
        callback(portToConnect);
    }
}

SerialConnection.prototype.connect = function(connectHandler, receiveHandler) {
    // Already connected
    if (this._isConnected) return;
    
    this._onConnect = connectHandler;
    this._onReceive = receiveHandler;
    
    var self = this;
    
    self.findPort(function(port) {
        // No port to connect to
        if (port == "") {
            if (self._onConnect) self._onConnect('Could Not Find Port');
            return;
        }
        
        self._arduinoSerialPort = new SerialPort(port, {
            baudrate: 9600,
            disconnectedCallback: self.onDisconnect,
            // look for return and newline at the end of each data packet:
            parser: serialPort.parsers.readline("\r\n")
        }, false); // this is the openImmediately flag [default is true]
        
        // Assume we are going to connect, to prevent duplicate attempts
        self._isConnecting = true;
        
        // TODO: Could buffer on the Arduino before sending
        self._arduinoSerialPort.open(function (error) {
            self._isConnecting = false;
            if ( error ) {
                self._isConnected = false;
                console.log('failed to open: '+error);
                if (self._onConnect) self._onConnect('Connection Not Oppened');
            } else {
                self._isConnected = true;
                console.log('Serial connection open');
                if (self._onConnect) self._onConnect();
                self._arduinoSerialPort.on('data', function(data) {
                    //console.log("Serial Data: " + data);
                    var serialJson = null;
                    try {
                        serialJson = JSON.parse(data);
                    } catch (error) { }
                    
                    if (serialJson) {
                        // console.log('data received: ' + JSON.stringify(serialJson));
                        // TODO: Pass json to another function
                        if (self._onReceive !== null) self._onReceive(serialJson);
                        self._serialData = "";
                    }
                    /*
                    try {
                        var serialJson = JSON.parse(self._serialData);
                        if (serialJson) {
                            // console.log('data received: ' + JSON.stringify(serialJson));
                            // TODO: Pass json to another function
                            if (self._onReceive !== null) self._onReceive(serialJson);
                            self._serialData = "";
                        }
                    } catch (error) {
                        // Not JSON yet
                    }
                    */
                });
            }
        });
    });
}

SerialConnection.prototype.send = function (message, callback) {
    if (!this._isConnected || this._isConnecting) {
        if (callback) callback('Not Connected', null);
        return;
    }
    
    this._arduinoSerialPort.write(message, callback);
}

exports = module.exports = SerialConnection;