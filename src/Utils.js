'use strict';

var R = require('ramda');
// Helpers
var petFields = [
    'uuid',
    'name'
];

var getPetAttributes = function(details) {
    return R.pick(petFields, details);
};

var createPet = function(details, owner) {
    if (!validatePet(details) || !owner) {
        return null;
    }

    var pet = getPetAttributes(details);
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
    createPet: createPet,
    getPetAttributes: getPetAttributes
};

