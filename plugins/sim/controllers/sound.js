var settings = require('nconf');
var fs = require('fs');
var wav = require('wav');
var Speaker = require('speaker');
var lame = require('lame');
var Volume = require('pcm-volume');
//var Player = require('player');
var path = require('path');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

// NOTE! Download latest mpg123 and replace dependency in Speaker. Rebuild.

// Define the constructor for your derived "class"
function Sound(filePath) {
    // call the super constructor to initialize `this`
    EventEmitter.call(this);
    
    this._filePath = path.resolve(__dirname, '../../../sounds', filePath);
    
    /*
    var self = this;
    
    var player = new Player(this._filePath);
    player.on('playend',function(item){
        // return a playend item 
        self.emit('end');
    });
    
    player.on('error', function(err){
        // when error occurs 
        // console.log(err);
    });
    
    this._player = player;
    */
    // TODO: Verify filepath is valid
    this._isValid = true;
    this._isPlaying = false;
    this._isPaused = false;
    this._volume = 1;
};

util.inherits(Sound, EventEmitter);

Sound.prototype.stop = function() {
    if (!this.speaker) return;
    this.fileStream.unpipe();
    this.speaker.end();
    this._isPlaying = false;
}

Sound.prototype.pause = function() {
     if (this._isPaused) {
        this.speaker = new Volume();
        this.speaker.setVolume(this._volume);
        this.speaker.pipe(new Speaker(this.format));
        this.stream.pipe(this.speaker);
      } else {
        this.speaker.end();
      }

      this._isPaused = !this._isPaused;
}

Sound.prototype.isPlaying = function() {
    return this._isPlaying;
}

Sound.prototype.play = function() {
    if (!this._isValid) return;
    //this._player.play();
    
    var self = this;
    
    var fileStream = fs.createReadStream(this._filePath);
    self.fileStream = fileStream;
    
    var ext = path.extname(self._filePath);
    if (ext == '.mp3') {
        var decoder = new lame.Decoder();
        self.stream = decoder;
    } else if (ext == '.wav') {
        var reader = new wav.Reader();
        self.stream = reader;
    }
    
    self.stream.on('end', function() {
        this._isPlaying = false;
        self.emit('end');
    });
    
    self.stream.once('format', function (format) {
        self.format = format;
        self.speaker = new Volume();
        self.speaker.setVolume(self._volume);
        self.speaker.pipe(new Speaker(format));
        self.stream.pipe(self.speaker);
    });
    
    this._isPlaying = true;
    fileStream.pipe(self.stream);
}

Sound.prototype.setVolume = function(volume) {
    //self._player.setVolume(volume);
    this._volume = volume;
    if (!this.speaker) return;
    this.speaker.setVolume(volume);
}

module.exports.Sound = Sound;

init();

function init() {
    if (!settings.get("play_sound")) return;
    
    var airlockSound = new Sound('airlock.mp3');
    airlockSound.on('end',function(item){
        var beep = new Sound('bleep.mp3');
        beep.setVolume(0.2);
        beep.play();
        beep.on('end',function(item){
            setTimeout(function () {
                beep.play();
            }, 10000);
        });
        
        var hum = new Sound('hum.mp3');
        hum.play();
        hum.on('end',function(item){
            setTimeout(function () {
                hum.play();
            }, 1);
        });
    });
    airlockSound.play();
}