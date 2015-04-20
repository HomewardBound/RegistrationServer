/*globals define*/

define([], function() {
    'use strict';

    var getAttribute = function(attr, obj) {
        return obj[attr];
    };

    return {
        getAttribute: getAttribute
    };
});
