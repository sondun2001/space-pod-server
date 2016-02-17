var settings = require('nconf');
var Sound = require('node-aplay');

init();

function init() {
    if (!settings.get("play_sound")) return;
    
    var music = new Sound(__dirname + '/sounds/bleep.wav');
    music.play();

    // you can also listen for various callbacks: 
    music.on('complete', function () {
        setTimeout(function () {
            music.play(); // pause the music after five seconds 
        }, 5000);
    });
}
