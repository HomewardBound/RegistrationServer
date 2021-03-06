'use strict';

var Utils = require('./Utils'),
    ObjectID = require('mongodb').ObjectID,
    async = require('async'),
    assert = require('assert');

module.exports = function(User, Pet, Location) {
    return {
        index: function(req, res) {
            // Get all pets for the given user
            console.log('Pets requested for ', req.user);
            Pet.find({owner: req.user._id}).toArray(function(err, pets) {
                // For each missing dog,
                //     if the dog is missing: get the locations
                //     else:                  remove the locations
                console.log('Found pets:', pets);
                async.map(pets, function addLocations(pet, cb) {
                    console.log('Adding location to '+ pet.name);
                    if (pet.isMeasuring) {  // Add the locations to the pet
                        Location.find({uuid: pet.uuid}).toArray(function(err, locations) {
                            console.log('Found locations: ',locations, ' ('+pet.name+')');
                            if (err) {
                                console.error('Could not find locations for '+pet.uuid, err);
                                locations = [];
                            }

                            pet.locations = locations;
                            return cb(null, pet);
                        });
                    } else {  // Clear the locations for the pet
                        Location.remove({uuid: pet.uuid}, function(err, result) {
                            console.error('Removed locations for ('+pet.name+')');
                            if (err) {
                                console.error('Could not remove the locations for '+pet.uuid, err);
                            }
                        });
                        pet.locations = null;
                        return cb(null, pet);
                    }
                }, function callback(err, results) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        console.log('Responding with', results);
                        res.status(200).json(results);
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
            var petId = req.body._id,
                pet = Utils.getPetAttributes(req.body);

            console.log('Received update:', pet, 'for', petId);
            assert(!!petId, 'Did not receive pet id');

            if (pet) { // Valid changes
                Pet.update({_id: ObjectID(petId)}, {$set: pet}, function(err, result) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    console.log('Update result:', result);
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
