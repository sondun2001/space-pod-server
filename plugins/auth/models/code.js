// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// Define our token schema
var CodeSchema   = new mongoose.Schema({
  value: { type: String, required: true }, // Authorization code.
  redirectUri: { type: String, required: true },
  userId: { type: String, required: true },
  clientId: { type: String, required: true }
});

// Execute before each user.save() call
CodeSchema.pre('save', function(callback) {
    var code = this;
    
    // Break out if the password hasn't changed
    if (!code.isModified('value')) return callback();
    
    // Password changed so we need to hash it
    bcrypt.genSalt(5, function(err, salt) {
        if (err) return callback(err);
        
        bcrypt.hash(code.value, salt, function(err, hash) {
            if (err) return callback(err);
            code.value = hash;
            callback();
        });
    });
});

CodeSchema.methods.verifyCode = function(code, cb) {
    bcrypt.compare(code, this.value, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// Export the Mongoose model
module.exports = mongoose.model('Code', CodeSchema);