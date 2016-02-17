var settings = require('nconf');
var fs = require('fs');
var wav = require('wav');
var Speaker = require('speaker');
var Volume = require('pcm-volume');
var path = require('path');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

// NOTE! Download latest mpg123 and replace dependency in Speaker. Rebuild.

// Define the constructor for your derived "class"
function Sound(filePath) {
    // call the super constructor to initialize `this`
    EventEmitter.call(this);
    
    this._filePath = path.resolve(__dirname, '../../../sounds', filePath);
    
    // TODO: Verify filepath is valid
    this._isValid = true;
};

util.inherits(Sound, EventEmitter);

Sound.prototype.play = function() {
    if (!this._isValid) return;
    
    var file = fs.createReadStream(this._filePath);
    var reader = new wav.Reader();
    
    var self = this;
    
    reader.on('format', function (format) {
        // the WAVE header is stripped from the output of the reader
        var speaker = new Volume();
        self.speaker = speaker;
        speaker.pipe(new Speaker(format))
        reader.pipe(speaker);
    });
    
    reader.on('end', function() {
        self.emit('end');
    });
    
    // pipe the WAVE file to the Reader instance
    file.pipe(reader);
}

Sound.prototype.setVolume = function(volume) {
    if (!this.speaker) return;
    
    this.speaker.setVolume(volume);
}

init();

function init() {
    if (!settings.get("play_sound")) return;
   
    var beep = new Sound('bleep.wav');
    beep.play();
    beep.on('end',function(item){
        setTimeout(function () {
            beep.play(); // pause the music after five seconds 
        }, 5000);
    });
}