/*globals google,define*/
define(['lodash',
       'Utils',
       'text!../html/header.html',
       'text!../html/new.html',
       'text!../html/card.html',
       'text!../html/content.html'],
function(_, 
         Utils,
         headerHTML, 
         createNewHTML, 
         cardHTML, 
         contentHTML) {

    'use strict';

    // Create a UI Manager
    // Create a Controller
    var cardTemplate = _.template(cardHTML),
        contentTemplate = _.template(contentHTML);

    var UIManager = function() {
        this.controller = null;
        this.currentPet = null;
        this.pets = [];

        if (document.readyState === 'complete') {
            this._initializeMap.bind(this);
        } else {
            google.maps.event.addDomListener(window, 'load', this._initializeMap.bind(this));
        }
    };

    UIManager.prototype._initializeMap = function() {
        console.log('Initializing map');
        var options = {
            center: {lat: 36.044188, lng: -86.727108},  // FIXME: Add appropriate location
            zoom: 17
            },
            container = document.getElementById('map-canvas');

        this.map = new google.maps.Map(container, options);
        google.maps.event.trigger(this.map, 'resize');
    };

    UIManager.prototype.updatePets = function(pets) {
        var html,
            cards = pets.map(function(pet) {
                return cardTemplate(_.merge({}, Utils.defaultPet, pet));
            }.bind(this));

        html = cards.join('\n');

        // Add the html to the header container
        var container = document.getElementById('pet-list-container');
        container.innerHTML = html;

        // Add event listeners for selecting the pet

        pets.forEach(function(pet) {
            var items;

            $('.toggle-missing').filter(function(i,e) {
                return e.getAttribute('data-id') === pet.uuid;
            }).click(this.toggleMissing.bind(this, pet));

            $('edit-btn-'+pet.uuid).click(this.toggleMissing.bind(this, pet)); // FIXME: Add the edit stuff
            $('#location-finder').filter(function(i,e) {
                return e.getAttribute('data-id') === pet.uuid;
            }).click(this.showLastLocation.bind(this, pet));


        }, this);
        // Add map trigger
        //$('.modal-trigger').leanModal();

        document.getElementById('registerPetButton').onclick = this.createPet.bind(this);
    };

    /**
     * Change the content to show the given pet or show new pet form.
     *
     * @param {Pet} pet
     * @return {undefined}
     */
    UIManager.prototype.selectPet = function(pet) {
        var container = document.getElementById('contentContainer'),
            content;

        if (pet) {
            content = contentTemplate(pet);
            container.innerHTML = content;

            // Attach click listeners
            document.getElementById('missingButton').onclick = this.toggleMissing.bind(this, pet);
        } else {  // Create new pet form
            content = createNewHTML;
            container.innerHTML = content;

            // Attach click listeners
        }

        this.currentPet = pet;
    };

    UIManager.prototype.toggleMissing = function(pet) {
        pet.isMeasuring = !pet.isMeasuring;
        this.controller.updatePet(pet);
    };

    UIManager.prototype.createPet = function() {
        var name = document.getElementById('name').value,
            uuid = document.getElementById('uuid').value,
            species = document.getElementById('species').value,
            isFemale = document.getElementById('isFemale').checked,
            sex = isFemale ? 'female' : 'male',
            breed = document.getElementById('breed').value,
            age = document.getElementById('age').value,
            isMeasuring = document.getElementById('isMeasuring').checked,
            notes = document.getElementById('notes').value;

        // Get the necessary info
        this.controller.createPet({name: name, 
                                   uuid: uuid,
                                   species: species,
                                   age: age,
                                   sex: sex,
                                   breed: breed,
                                   isMeasuring: isMeasuring,
                                   notes: notes
                                  });
    };

    UIManager.prototype.showLastLocation = function(pet) {
        if (pet.locations) {
        var location = pet.locations.pop();
        window.location = 'https://www.google.com/maps/@'+location.latitude+
        ','+location.longitude+',17z';
        } else {
        }
    };

    UIManager.prototype.updatePet = function(pet) {
    };

    return UIManager;
});
