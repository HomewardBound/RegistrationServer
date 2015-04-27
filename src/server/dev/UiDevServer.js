'use strict';

var express = require('express'),
    R = require('ramda'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    engines = require('consolidate'),
    session = require('express-session'),
    async = require('async'),

    hostname = process.env.HOST || 'localhost';

/*
 * This is a mock server for developing UI without using any authentication
 */
var defaultPet = {
    isMeasuring: false,
    name: 'UNKNOWN'
};
var Server = function() {
    this.port = process.env.PORT || 8888;

    this.pets = {};

    // Configure app endpoints
    this.app = express();
    this.configureEndpoints();
};

// Endpoints:
//    GET       /                   Landing page
//    GET       /pets               Get all owner's pets  
//    PATCH     /pets/id            Update the given pets
//    DELETE    /pets/id            Delete the given pets
//    PUT       /pets               Create a new pets
Server.prototype.configureEndpoints = function() {
    // Authentication
    this.app.use(bodyParser.json({extended: true}));
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(cookieParser());
    this.app.use(session({resave: false, 
                          saveUninitialized: false,
                          secret: 'somerandasdfodsecret'}));

    // Views settings
    this.app.set('views', __dirname + '/../../client');
    this.app.use(express.static(__dirname + '/../../client'));
    this.app.engine('html', engines.mustache);
    this.app.set('view engine', 'html');
    // Landing page
    this.app.get('/', function(req, res) {
        res.render('/index');
    });

    // Get index
    this.app.get('/pets', function(req, res) {
        console.log('Pets are', this.pets);
        res.json(R.values(this.pets));
    }.bind(this));

    // Update
    this.app.patch('/pets', function(req, res) {
        var petId = req.body.uuid,
            pet = this.pets[petId];
        
        if (pet) {
            this.pets[petId] = R.merge(pet, req.body);
            console.log('Updated pet to', R.merge(pet, req.body));
            return res.status(200).send('Pet has been updated!');
        } 
        return res.status(400).send('Invalid Request');
    }.bind(this));

    // Delete
    this.app.delete('/pets', function(req, res) {
        var petId = req.body.uuid;

        if (this.pets[petId]) {
            delete this.pets[petId];
            return res.status(200).send('Removed pet');
        }
        return res.status(500).send('Pet not found');
    }.bind(this));

    // Create
    this.app.put('/pets', function(req, res) {
        var petId = req.body.uuid,
            pet = R.merge(defaultPet, R.omit(['petId'], req.body));

        console.log('req.body', req.body);
        pet._id = petId;
        this.pets[petId] = pet;
        return res.status(200).send(JSON.stringify(pet));
    }.bind(this));

    // User dashboard
    this.app.get('/dashboard',
        function(req, res) {
            res.render('dashboard');
        });
};

Server.prototype.start = function(callback) {
    callback = callback || function(){};
    if (this.app) {
        console.log('Starting server...');
        this.app.listen(this.port, function() {
            console.log('App listening on port', this.port);
            callback();
        }.bind(this));
    } else {
        this.onStart = callback;
    }
};

// Run the server
var server = new Server();
server.start();
console.log('\n'+new Array(40).join('* '));
console.log('Running the Dev-UI Server. This is for development only!');
console.log('All data is stored in memory and will not persist on server restarts!');
console.log(new Array(40).join('* ')+'\n');
