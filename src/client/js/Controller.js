/*globals define*/
define(['lodash',
       'text!../html/header.html',
       'text!../html/content.html'],
function(_, 
         headerHTML, 
         contentHTML) {

    'use strict';

    var Controller = function(ui) {
        this.ui = ui;
        this.pets = [];
        this.updatePets();
    };

    /**
     * Load all initial data.
     *
     * @return {undefined}
     */
    Controller.prototype.updatePets = function() {
        this._request('get', null, function(response) {
            var pets = JSON.parse(response);
            this.pets = pets;
            this.ui.updatePets(pets);
        }.bind(this));
    };

    Controller.prototype._request = function(type, content, callback) {
        var c = JSON.stringify(content),
            req = new XMLHttpRequest();

        req.onload = function(e) {
            callback(req.responseText);
        };
        req.open(type, '/pets', true);
        req.setRequestHeader("Content-Type", "application/json");
        if (type.toLowerCase() !== 'get') {
            req.setRequestHeader("Content-Length", c.length);
        }
        req.send(JSON.stringify(content));
    };

    Controller.prototype.updatePet = function(pet) {
        this._request('PATCH', pet, this.updatePets.bind(this));
    };

    Controller.prototype.createPet = function(pet) {
        this._request('put', pet, this.updatePets.bind(this));
    };

    return Controller;
});
