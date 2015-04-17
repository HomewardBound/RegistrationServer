'use strict';

var R = require('ramda');
// Helpers
var petFields = [
    'uuid',
    'name'
];
var createPet = function(details, owner) {
    if (!validatePet(details) || !owner) {
        return null;
    }

    var pet = R.pick(petFields, details);
    pet.owner = owner;
    pet.isMeasuring = false;
    return pet;
};

var validatePet = function(pet) {
    var hasKey = R.has(R.__, pet);
    return R.all(hasKey, petFields);
};

// Helpers
module.exports = {
    createPet: createPet
};

