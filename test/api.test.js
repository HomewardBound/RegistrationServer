/*globals describe,it,before,beforeEach*/
'use strict';
var supertest = require('supertest'),
    port = 8493,
    api = supertest('http://localhost:'+port),  // https?
    expect = require('expect'),
    Server = require('../src/server/Server');

describe('Logging in tests', function() {
    before(function(done) {
        new Server({port: port}).start(done);
    });

    describe('Unauthenticated tests', function() {
        it('should read / when not authenticated', function(done) {
            api.get('/').expect(200, done);
        });

        it('should not read pets when not authenticated', function(done) {
            api.get('/pets').expect(302, done);
        });

        it('should not update pet when not authenticated', function(done) {
            api.patch('/pets').expect(302, done);
        });

        it('should not delete pet when not authenticated', function(done) {
            api.delete('/pets').expect(302, done);
        });

        it('should not create pet when not authenticated', function(done) {
            api.put('/pets').expect(302, done);
        });
    });

    describe.skip('Authenticated tests', function() {
        var petCount;
        before(function() {
            // AUTHENTICATE!
            // How do I fake authentication for testing?
            // TODO
        });

        it('should return 200 on create pet', function(done) {
            api.put('/pets').expect(200, done);
        });

        it.skip('should get pet list', function(done) {
            api.get('/pets')
                .expect(200)
                .expect({}, done); // FIXME
        });

        it.skip('should create pet', function(done) {
            api.put('/pets').expect(200, function checkPet() {
                // TODO: Check that the pet was added
                done();
            });
        });

        it.skip('should update pet', function(done) {
            api.patch('/pets').expect(200, function checkPet() {
                // TODO: Check that the pet was updated
                done();
            });
        });

        it.skip('should delete pet', function(done) {
            api.delete('/pets').expect(200, function checkPet() {
                // TODO: Check that the pet was deleted
                done();
            });
        });
    });
});
