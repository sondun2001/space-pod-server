// TODO: Set up basic auth (username / pass)
// TODO: Set up fancy auth (OAUTH2, permissions, etc)
// TODO: Secure Application (HTTPS, hash keys, secrets, etc)
// TODO: Bring over steam login?
module.exports = function setup(options, imports, register) {
    // Get the database
    var server = imports.server;
    var settings = imports.config;
    
    // Utils
    var validator = require('validator');
    var _ = require('underscore');
    
    // Controllers
    try {
        var userController = require('./controllers/user');
        var tokenController = require('./controllers/token'); // Using jsonwebtoken
    } catch (error) {
        console.log(error);
    }
    
    // Used for authentication strategies (TODO: Encrypt?)
    var passport = require('passport');
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    
    // Allow json web token for individual authentication
    var opts = {}
    opts.secretOrKey = settings.get('secret');
    // TODO: What do we need to send for these?
    //opts.issuer = settings.get('issuer'); //"accounts.rebelo.me";
    //opts.audience = settings.get('audience'); //['mess_agent', 'mess.rebelo.me'];
    //opts.tokenBodyField = 'x-access-token';
    //opts.tokenQueryParameterName = 'x-access-token';
    
    var JwtStrategy = require('passport-jwt').Strategy;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        if (jwt_payload == null || jwt_payload == undefined) return done('Could not find token.', null);
        return done(null, jwt_payload);
    }));
    
    // Used for logging in through google through backend
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    passport.use(new GoogleStrategy({
        clientID: settings.get('google_client_id'),
        clientSecret: settings.get('google_client_secret'),
        callbackURL: settings.get('host') + "/auth/google/callback"
    }, providerAuthCallback));
    
    // Used for accepting a google token and exchanging it for a JWT
    var GoogleTokenStrategy = require('passport-google-token').Strategy;
    
    passport.use(new GoogleTokenStrategy({
        clientID: settings.get('google_client_id'),
        clientSecret: settings.get('google_client_secret'),
    }, providerAuthCallback ));
    
    function providerAuthCallback(accessToken, refreshToken, profile, done) {
        if (profile.emails.length === 0 || !_.isObject(profile.emails[0]) || !validator.isEmail(profile.emails[0].value)) {
            return done(new Error('Your account did not have an email address associated with it'));
        }

        var email = profile.emails[0].value;
        var id = profile.id;
        var provider = profile.provider;
       
        // Find User
        userController.getUserByEmail(email, function(err, user) {
            if (err) {
                // Create User
                var userConfig = {
                    email: email,
                    name: profile.displayName
                }
                
                // Add provider specific id
                userConfig[provider + '_id'] = id;
                
                // Now create user
                userController.createUser(userConfig, function(err, result) {
                    return done(err, result.user);
                });
            } else {
                return done(null, user);
            }
        });
    }
    
    var isAuthenticated = passport.authenticate(['jwt', 'bearer'], { session : false });
    //var isAuthenticated = passport.authenticate('google', { session : false });
    
    // TODO: Remove once passport is working
    //var isAuthenticated = tokenController.verifyToken;
    
    // Get User Router
    var getUserRouter = server.Router();
    
    // Secure this entire router
    getUserRouter.use(isAuthenticated);
    
    // Get all users
    getUserRouter.route('/')
    .get(userController.getUsers);
    
    // Register the router
    server.use('/users', getUserRouter);
    
    // Get another router
    var router = server.router;
    
    // Setup the Admin user
    router.route('/setup')
    .get(userController.setup)
    
    // Add a new user
    router.route('/user')
    .get(isAuthenticated, userController.getUser)
    .post(userController.postUser)
    
    // Authenticate user
    router.route('/auth')
    .post(tokenController.authenticateUser)
    
    router.route('/auth/google')
    .get(passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));
    
    router.route('/auth/google/callback')
    .get(passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });
    
    // Verify Google Token!
    router.route('/auth/google/token')
    .post(passport.authenticate('google-token'), tokenController.authenticateGUser);
    
    // Register the router
    //server.use('/', router);
    
    // Register the plugin
    register(null, {
        auth: {
            isAuthenticated:isAuthenticated
        }
    });
};