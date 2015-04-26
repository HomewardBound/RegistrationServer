'use strict';

var R = require('ramda');
// Helpers
var requiredPetFields = [
    'uuid',
    'name'
];

var petFields = [
    'species',
    'breed',
    'notes',
    'dateOfBirth',
    'isMeasuring'
];

var getPetAttributes = function(details) {
    return R.pick(petFields.concat(requiredPetFields), details);
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
    return R.all(hasKey, requiredPetFields);
};

// Helpers
module.exports = {
    createPet: createPet,
    getPetAttributes: getPetAttributes
};

