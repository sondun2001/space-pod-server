var bcrypt = require('bcrypt');
var thinky = require('../../db/thinky.js');
var type = thinky.type;

var User = thinky.createModel("User", {
    email: type.string(),
    name: type.string(),
    password: type.string().optional(),
    google_id: type.string().optional(),
    steam_id: type.string().optional(),
    verified: type.boolean().default(false)
});

User.ensureIndex('email');

// Execute before each user.save() call
User.pre('save', function(next) {
    var user = this;
    
    // No password, no need to encryp!
    if (!user.password) return next();
    
    // If no password, make sure we have a provider
    var oldUser = user.getOldValue();
    
    // Break out if the password hasn't changed
    if (oldUser && !user.password === oldUser.password) return next();
    
    // Password changed so we need to hash it
    bcrypt.genSalt(5, function(err, salt) {
        if (err) return next(err);
        
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

User.define("verifyPassword", function(password, cb) {
     bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
});

module.exports = User;