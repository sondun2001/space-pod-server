var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'Space Pod Stats';

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  tags: true,
  border: {
    type: 'line'
  },
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

var fuelBar = blessed.progressbar({
  parent: box,
  top: 'center',
  left: 'center',
  padding: {
    left: 1,
    right: 1
  },
  //width: '50%',
  height: '15%',
  border: {
    type: 'line'
  },
  style: {
    bar: {
        fg: 'green',
        bg: 'black'
    },
    border: {
      fg: '#f0f0f0'
    }
  },
  orientation: 'horizontal'
});

/*
// If box is focused, handle `enter`/`return` and give us some more content.
box.key('enter', function(ch, key) {
  box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  box.setLine(1, 'bar');
  box.insertLine(1, 'foo');
  screen.render();
});
*/

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

module.exports.render = function(simController) {
    // Focus our element.
    box.focus();
    fuelBar.focus();
    
    fuelBar.setProgress(simController.simState.fuelLevel * 100);
    //fuelBar.setProgress(20);
    
    // Render the screen.
    screen.render();
}