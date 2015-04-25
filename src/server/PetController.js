'use strict';

var Utils = require('./Utils'),
    ObjectID = require('mongodb').ObjectID,
    async = require('async'),
    assert = require('assert');

module.exports = function(User, Pet, Location) {
    return {
        index: function(req, res) {
            // Get all pets for the given user
            console.log('Received index. User is ', req.user);
            Pet.find({owner: req.user._id}).toArray(function(err, pets) {
                // For each missing dog,
                //     if the dog is missing: get the locations
                //     else:                  remove the locations
                async.map(pets, function addLocations(pet) {
                    if (pet.isMeasuring) {  // Add the locations to the pet
                        Location.find({uuid: pet.uuid}).toArray(function(err, locations) {
                            if (err) {
                                console.error('Could not find locations for '+pet.uuid, err);
                                locations = [];
                            }

                            pet.locations = locations;
                            return pet;
                        });
                    } else {  // Clear the locations for the pet
                        Location.remove({uuid: pet.uuid}, function(err, result) {
                            if (err) {
                                console.error('Could not remove the locations for '+pet.uuid, err);
                            }
                        });
                        pet.locations = null;
                        return pet;
                    }
                }, function callback(err) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json(pets);
                    }
                });
            });
        },

        create: function(req, res) {
            // Add pet for the given user
            console.log('Received create');
            console.log('uuid:', req.uuid);
            console.log('body:', req.body);
            var newPet = Utils.createPet(req.body, req.user._id);
            console.log('newPet', newPet);
            if (newPet) {
                Pet.insert(newPet, function(err, pet) {
                    if (err) {
                        return res.serverError(err);
                    }

                    // Remove the owner id? FIXME
                    return res.status(200).send(JSON.stringify(pet));
                });
            } else {
                return res.status(400).send('Invalid pet');  // Malformed pet
            }
        },

        update: function(req, res) {
            // Update pet for the given user
            var petId = req.body.petId,
                pet = Utils.getPetAttributes(req.body);

            console.log('Received update:', req.body, 'for', petId);
            assert(!!petId, 'Did not receive pet id');

            if (pet) {
                Pet.update({_id: ObjectID(petId)}, {$set: pet}, function(err, result) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    return res.status(200).send('Pet has been updated!');
                });
            } else {
                return res.status(400).send('Invalid Request');
            }
        },

        destroy: function(req, res) {
            // Destroy pet for the given user
            var petId = req.body.petId;
            console.log('Received destroy for', petId);

            assert(!!petId, 'Did not receive pet id');

            Pet.remove({_id: ObjectID(petId)}, function(err, result) {
                if (err) {
                    return res.status(500).send(err);
                }
                return res.status(200).send('Removed pet');
            });
        }
    };
};
