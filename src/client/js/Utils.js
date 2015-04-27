/*globals define*/

define([], function() {
    'use strict';

    var getAttribute = function(attr, obj) {
        return obj[attr];
    };

    var defaultPet = {
        name: 'Unknown',
        uuid: 'None',
        breed: 'Unknown',
        notes: '',
        isMeasuring: false,
        dateOfBirth: 4,  // FIXME
        species: 'Dog'
    };

    return {
        defaultPet: defaultPet,
        getAttribute: getAttribute
    };
});
