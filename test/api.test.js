/*globals describe,it,before,beforeEach*/
'use strict';
var supertest = require('supertest'),
    port = 8493,
    api = supertest('http://localhost:'+port),  // https?
    expect = require('expect'),
    Server = require('../src/Server');

describe('Server-DB tests', function() {
});

describe('Logging in tests', function() {
    before(function(done) {
        new Server({port: port}).start(done);
    });

    describe('Unauthenticated tests', function() {
        it('should read / when not authenticated', function(done) {
            api.get('/').expect(200, done);
        });

        it('should not read dogs when not authenticated', function(done) {
            api.get('/pets').expect(302, done);
        });

        it('should not update dog when not authenticated', function(done) {
            api.patch('/pets').expect(302, done);
        });

        it('should not delete dog when not authenticated', function(done) {
            api.delete('/pets').expect(302, done);
        });

        it('should not create dog when not authenticated', function(done) {
            api.put('/pets').expect(302, done);
        });
    });
});
