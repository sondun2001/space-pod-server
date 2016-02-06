// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var Client = require('../models/client');
var uid = require('uid');
var bcrypt = require('bcrypt');

passport.use('client-basic', new BasicStrategy(
  function(username, password, callback) {
    Client.findOne({ id: username }, function (err, client) {
      if (err) { return callback(err); }

      // No client found with that id or bad password
      if (!client || client.secret !== password) { return callback(null, false); }

      // Success
      return callback(null, client);
    });
  }
));

exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });

// Create endpoint /api/client for POST
exports.postClients = function(req, res) {
    // Create a new instance of the Client model
    var client = new Client();
    
    // Set the client properties that came from the POST data
    client.name = req.body.name;
    client.id = uid(32);
    client.secret = uid(32); // TODO-SECURITY: Hash Secret!
    client.userId = req.user._id;
    
    // TODO: Allow only admins to approve new clients?
    
    // Save the client and check for errors
    client.save(function(err) {
        if (err) res.send(err);
        res.json({ message: 'Client added!', data: client });
    });
};

// Create endpoint /api/clients for GET
exports.getClients = function(req, res) {
    // Use the Client model to find all clients belonging to this user
    Client.find({ userId: req.user._id }, function(err, clients) {
        if (err) res.send(err);
        res.json(clients);
    });
};