'use strict';

var Utils = require('./Utils'),
    ObjectID = require('mongodb').ObjectID,
    assert = require('assert');

module.exports = function(User, Pet) {
    return {
        index: function(req, res) {
            // Get all pets for the given user
            console.log('Received index. User is ', req.user);
            Pet.find({owner: req.user._id}).toArray(function(err, pets) {
                res.status(200).json(pets);
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
            console.log('Received update:', req.body);
            var petId = req.body.petId;
            assert(!!petId, 'Did not receive pet id');

            Pet.update({_id: ObjectID(petId)}, function(err, result) {
                if (err) {
                    return res.status(500);
                }
                return res.status(200);
            });
        },

        destroy: function(req, res) {
            // Destroy pet for the given user
            console.log('Received destroy');
            var petId = req.body.petId;
            assert(!!petId, 'Did not receive pet id');

            Pet.remove({_id: petId}, function(err, result) {
                if (err) {
                    return res.status(500);
                }
                return res.status(200);
            });
        }
    };
};
