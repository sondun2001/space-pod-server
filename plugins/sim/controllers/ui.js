var blessed = require('blessed');
var box;
var fuelBar;
var screen;

module.exports.init = function() {
    // Create a screen object.
    screen = blessed.screen({
        smartCSR: true
    });

    screen.title = 'Space Pod Stats';

    // Create a box perfectly centered horizontally and vertically.
    box = blessed.box({
        width: '100%',
        height: '100%',
        tags: true,
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: '#f0f0f0'
            }
        }
    });

    // Append our box to the screen.
    screen.append(box);

    fuelBar = blessed.progressbar({
        parent: box,
        width: '50%',
        height: '10%',
        border: {
            type: 'line'
        },
        barFg: 'white',
        barBg: 'black',
        orientation: 'horizontal'
    });
    
    //screen.append(fuelBar);
    
    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });
}


/*
// If box is focused, handle `enter`/`return` and give us some more content.
box.key('enter', function(ch, key) {
  box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  box.setLine(1, 'bar');
  box.insertLine(1, 'foo');
  screen.render();
});
*/

var value = 0;
module.exports.render = function(simController) {
    // Focus our element.
    box.focus();
    fuelBar.focus();
    
    //fuelBar.setProgress(simController.simState.fuelLevel * 100);
    fuelBar.setProgress(value);
    value++;
    
    // Render the screen.
    screen.render();
}