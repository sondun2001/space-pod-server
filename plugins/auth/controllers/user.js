var User = require('../models/user');
var settings = require('nconf');

// Function to create user
function createUser(userConfig, callback) {
    // Create user
    var user = new User(userConfig);
    
    // Save the user
    user.save(function(err) {
        if (err) {
            callback(err, {user:null, message:'User creation failed.'});
        } else {
            callback(null, {user:user, message:'User created successfully.'});
        }
    });
}

exports.createUser = createUser;

function getUserByEmail(email, callback) {
    User.getAll('email', {index:'email'}).run().then(function(users) {
        if (users.length === 0) return callback('No User Found', null);
        callback(null, users[0]);
    }).error(function(err) {
         callback(err, null);
    });
}

exports.getUserByEmail = getUserByEmail;

function getUserByProviderId(key, value, callback) {
    var filter = {};
    filter[key] = value;
    User.filter(filter).run().then(function(result) {
        if (result.length === 0) return callback('No User Found', null);
        callback(null, result[0]);
    }).error(function(err) {
        callback(err, null);
    })
}

exports.getUserByProviderId = getUserByProviderId;

exports.setup = function(req, res) {
    createUser(settings.get('test_user'), function(err, result) {
        if (err == false) throw result.message;
        res.status(201).json(result);
    });
};

// Create endpoint /api/users for POST
exports.postUser = function(req, res) {
    var userConfig = { 
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
    }
    
    createUser(userConfig, function(err, result) {
        if (err) return res.status(500).json(result);
        return res.status(201).json(result);
    });
};

// Create endpoint /api/users for GET
exports.getUser = function(req, res) {
    return res.status(200).json(req.user);
    getUserByEmail(req.params.email, function(err, user) {
        if (err) {
            return res.status(401).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json(user);
    });
};

// Create endpoint /api/users for GET
exports.getUsers = function(req, res) {
    User.run().then(function(users) {
        res.json(users);
    }).error(function(err) {
        if (err) {
            return res.status(401).json({ success: false, message: 'Users not found.' });
        }
    });
};