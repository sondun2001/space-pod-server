var settings = require('nconf');

init();

function init() {
    if (!settings.get("play_sound")) return;
    
    var Player = require('player');
    module.exports.Player = Player;
    
    var beep = new Player('../../../sounds/bleep.wav');
    beep.play();
    beep.on('playend',function(item){
        setTimeout(function () {
            beep.play(); // pause the music after five seconds 
        }, 5000);
    });
}
