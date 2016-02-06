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
    var ejs = require('ejs');
    
    var app = express();
    
    // Enable cross origin
    app.use(cors());
    
    // Set view engine to ejs
    app.set('view engine', 'ejs');

    var server = require('http').createServer(app);
    var io = require('socket.io')(server);
    var socketioJwt = require('socketio-jwt');
    
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
    /*
    router.use(function(req, res, next) {
        // Use this for security?
        // console.log('Activity');
        next();
    });
    
    router.get('/', function (req, res) {
        res.json({message: 'API Server Status: Online'});
    });
    */
    
    // Register router
    app.use('/', router);
    
    //https://auth0.com/blog/2014/01/15/auth-with-socket-io/
    io.set('authorization', socketioJwt.authorize({
        secret: settings.get("secret"),
        handshake: true
    }));
    
    //io.on('connection', function () { /* … */ });
    io.sockets
    .on('connection', function (socket) {
        console.log(socket.handshake.decoded_token.name, 'connected');
        //socket.on('event');
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
                
                router : router
            }
        });
    });
};