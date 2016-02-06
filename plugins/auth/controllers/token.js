var User = require('../models/user');
var settings = require('nconf');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify token

// Token!
function generateTokenResponse(user, res) {
    var token = jwt.sign(user, settings.get("secret"), {
        expiresIn: 2592000 // expires in 30 days
    });

    // return the information including token as JSON
    res.status(200).json({
        success: true,
        message: 'Login Success!',
        token: token
    });
}

// Token has already been passed through passport and user retrieved
exports.authenticateGUser = function(req, res) {
    var user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication failed.' });
    } else if (user) {
        generateTokenResponse(user, res);
    }
}

exports.authenticateUser = function(req, res) {
    User.get(req.body.email).run().then(function(user) {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication failed.' });
        } else if (user) {
            // Make sure the password is correct
            user.verifyPassword(req.body.password, function(err, isMatch) {
                if (isMatch) {
                    generateTokenResponse(user, res);
                } else {
                    res.status(401).json({ success: false, message: 'Authentication failed.' });
                }
            });
        }
    }).error(function(err) {
        if (err) {
            return res.status(401).json({ success: false, message: 'Authentication failed.' });
        }
    });
}

function validateToken (req, callback) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, settings.get("secret"), function(err, decoded) {      
            if (err) {
                return callback(false, 401, { success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.user = decoded;    
                return callback(true);
            }
        });
    } else {
        return callback(false, 401, { success: false, message: 'No token provided.' });
    }
}

exports.verifyTokenNoResponse = function (req, callback) {
    validateToken(req, callback);
}

exports.verifyToken = function (req, res, next) {
    validateToken(req, function (success, status, message) {
        if (success) {
            next();
        } else {
            return res.status(status).json(message);    
        }
    });
}