var blessed = require('blessed');
var contrib = require('blessed-contrib');
var screen = blessed.screen();
var grid;
var donut;
var lcd;

var lcd_options = {
    segmentWidth: 0.06 // how wide are the segments in % so 50% = 0.5
    , segmentInterval: 0.11 // spacing between the segments in % so 50% = 0.550% = 0.5
    , strokeWidth: 0.11 // spacing between the segments in % so 50% = 0.5
    , elements: 8 // how many elements in the display. or how many characters can be displayed.
    , display: 'STARTUP' // what should be displayed before first call to setDisplay
    , elementSpacing: 1 // spacing between each element
    , elementPadding: 2 // how far away from the edges to put the elements
    , color: 'white' // color for the segments
    , label: 'Status'
} 

module.exports.init = function() {
    var grid = new contrib.grid({rows: 8, cols: 48, screen: screen});
    
    lcd = grid.set(0, 0, 4, 48, contrib.lcd, lcd_options);
     
    donut = grid.set(4, 0, 4, 48, contrib.donut, {
        label: 'Pod State',
        radius: 8,
        arcWidth: 3,
        remainColor: 'black',
        yPadding: 2
    })
   
   screen.key(['escape', 'q', 'C-c'], function(ch, key) {
     return process.exit(0);
   });

   screen.render()
}

// TODO: Include dependencies, we don't need to pass this in.
module.exports.setData = function(data) {
    
    /*
    console.log('\033[2J');
    console.log("  Engine:  " + (_stateOutBuffer.ep * 100) + "%");
    console.log("  ");
    console.log("  Fuel:    " + (_stateOutBuffer.fl * 100) + "%");
    console.log("  Battery: " + (_stateOutBuffer.al * 100) + "%");
    console.log("  Water:   " + (_stateOutBuffer.wl * 100) + "%");
    console.log("  Oxygen:  " + (_stateOutBuffer.ol * 100) + "%");
    console.log("  ");
    */
    
    if (data.wf == 0) {
        lcd.setDisplay('OK');
        lcd_options.color = 'green';
        lcd.setOptions(lcd_options);
    } else {
        lcd.setDisplay('WARNING');
        lcd_options.color = 'red';
        lcd.setOptions(lcd_options);
    }
    
    // TODO: Update color if value is under warning threshold
    donut.setData([
        {percent: data.ep * 100, label: 'Engine','color': 'blue'},
        {percent: data.fl * 100, label: 'Fuel','color': 'green'},
        {percent: data.al * 100, label: 'Battery','color': 'green'},
        {percent: data.ol * 100, label: 'Oxygen','color': 'green'}
    ]);
    
    screen.render();
}