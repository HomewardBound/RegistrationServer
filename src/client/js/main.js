/*globals define*/
// Entry point for our application
require.config({
    paths: {
        lodash: './lib/lodash.min'
    },
    map: {
        '*': {
            'text': './lib/require-text/text'
        }
    }
});

define(['UIManager',
       'Controller'],
function(UIManager, 
         Controller) {

    'use strict';

    // Create a UI Manager & Controller
    var ui = new UIManager(),
        controller = new Controller(ui);

    ui.controller = controller;  // Tightly coupled :(

    console.log('Loaded!');
});
