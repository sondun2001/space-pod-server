// This is our API/WebSocket server. This will serve as the endpoint to all user facing clients
// TODO: We probably don't need socket.io. Leaving it in, in case we need direct communication to this server - Security Hole?
// TODO: Security? How do we secure communication for sensitive requests (PUT, DELTE)
module.exports = function setup(options, imports, register) {
    var settings = imports.config;
    
    var express = require('express');
    var cors = require('cors');
    var bodyParser = require('body-parser');
    var passport = require('passport');
    var session = require('express-session');
    
    var app = express();
    
    // Enable cross origin
    app.use(cors());
    
    var server = require('http').createServer(app);
    var io = require('socket.io')(server);
    
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));
    
    // parse application/json
    app.use(bodyParser.json());
    
    app.use (passport.initialize());
    
    // Use express session support since OAuth2orize requires it
    app.use(session({
        secret: settings.get('session_key'),
        saveUninitialized: true,
        resave: true
    }));
    
    var router = express.Router();
  
    // Register router
    app.use('/', router);
    
    io.on('connection', function (socket) {
        /*
        socket.on('disconnect', function(){
            console.log('User disconnected');
        });
        */
    });
    
    server.listen(settings.get('port'), function (callback) {
        var port = server.address().port;
        console.log('Listening on port %s', port);
        
        register(null, {
            server: {
                // Expose server plugin functions here
                use : function (prefix, router) {
                    app.use(prefix, router);  
                },
            
                Router : function () {
                    return express.Router();
                },
                
                router : router,
                socket: io
            }
        });
    });
};