/*globals define*/
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
    };

    UIManager.prototype.updatePets = function(pets) {
        var html,
            cards = pets.map(function(pet) {
                return cardTemplate(_.merge(Utils.defaultPet, pet));
            }.bind(this));

        html = cards.join('\n');

        // Add the html to the header container
        var container = document.getElementById('pet-list-container');
        container.innerHTML = html;

        // Add event listeners for selecting the pet

        pets.forEach(function(pet) {
            var items;

            $('.toggle-missing-'+pet.uuid).click(this.toggleMissing.bind(this, pet));

            $('edit-btn-'+pet.uuid).click(this.toggleMissing.bind(this, pet)); // FIXME: Add the edit stuff

        }, this);
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
            // TODO
            document.getElementById('registerPetButton').onclick = this.createPet.bind(this);
        }

        this.currentPet = pet;
    };

    UIManager.prototype.toggleMissing = function(pet) {
        pet.isMeasuring = !pet.isMeasuring;
        this.controller.updatePet(pet);
    };

    UIManager.prototype.createPet = function() {
        var name = document.getElementById('name').value,
            uuid = document.getElementById('uuid').value;

        // Get the necessary info
        this.controller.createPet({name: name, uuid: uuid});
    };

    UIManager.prototype.updatePet = function(pet) {
    };

    return UIManager;
});
