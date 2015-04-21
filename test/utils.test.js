/*globals describe,it,before,beforeEach*/
'use strict';

var Utils = require('../src/server/Utils'),
    expect = require('expect');

describe('Utils', function() {
    describe('Pet utilities', function() {

        it('should create pet with correct keys', function() {
            var res = Utils.createPet({uuid: 'asdfasd', name: 'Spot'}, 'ownerid');
            expect(res).toNotBe(null);
        });

        it('should not create pet with incorrect keys', function() {
            var res = Utils.createPet({uuid: 'asdfasd'}, 'ownerId');
            expect(res).toBe(null);
        });

        it('should not create pet without owner', function() {
            var res = Utils.createPet({uuid: 'asdfasd', name: 'Spot'}, null);
            expect(res).toBe(null);
        });

    });
});
