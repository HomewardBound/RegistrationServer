/*globals define*/
define(['lodash',
       'Utils',
       'text!../html/header.html',
       'text!../html/new.html',
       'text!../html/content.html'],
function(_, 
         Utils,
         headerHTML, 
         createNewHTML, 
         contentHTML) {

    'use strict';

    // Create a UI Manager
    // Create a Controller
    var headerTemplate = _.template(headerHTML),
        contentTemplate = _.template(contentHTML);

    var UIManager = function() {
        this.controller = null;
        this.currentPet = null;
        this.pets = [];
    };

    UIManager.prototype.updatePets = function(pets) {
        var names = pets.map(Utils.getAttribute.bind(null, 'name')),
            html = headerTemplate({pets: pets});

        // Add the html to the header container
        var container = document.getElementById('headerContainer');
        container.innerHTML = html;

        this.selectPet(this.currentPet || pets[0]);

        // Add event listeners for selecting the pet
        var nodes = container.children,
            pet;

        for (var i = nodes.length; i--;) {
            pet = pets[i];
            nodes[i].onclick = this.selectPet.bind(this, pet);
        }
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
        this.selectPet(pet);
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
