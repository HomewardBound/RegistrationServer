'use strict';

var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    async = require('async'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,

    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,

    PetController = require('./PetController'),
    UserController = require('./UserController'),
    hostname = 'localhost';

var Server = function(opts) {
    opts = opts || {};
    this.port = opts.port || 8888;
    this.mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/homeward-bound';

    // Configure Models
    this.models = {
        pet: null,
        user: null
    };

    this.configureModels(function() {
        // Configure Controllers
        this.controllers = {
            pet: new PetController(this.models.user, this.models.pet),
            user: new UserController(this.models.user, this.models.pet)
        };

        // Configure authentication
        this.configureAuthentication();

        // Configure app endpoints
        this.app = express();
        this.configureEndpoints();

        // If the server has already been started
        if (this.onStart !== null) {
            this.start(this.onStart);
        }
    }.bind(this));
};

Server.prototype.configureAuthentication = function() {
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        this.models.user.findOne({_id: ObjectID(id)}, function(err, user) {
            done(err, user);
        });
    }.bind(this));

    passport.use(new GoogleStrategy({
        returnURL: 'http://'+hostname+':'+this.port+'/auth/google/return',
        realm: 'http://'+hostname+':'+this.port
    }, function(identifier, profile, done) {
        // Find the user or create the user
        this.models.user.findOne({openId: identifier}, /*{limit: 1},*/ function(err, user) {
            if (!user) {
                this.models.user.insert({openId: identifier, 
                                         email: profile.emails[0].value},  // First email
                                         function(err, res) {
                    done(err, res);
                }.bind(this));
            } else {
                done(err, user);
            }
        }.bind(this));
    }.bind(this)));
};

Server.prototype.configureModels = function(callback) {
    MongoClient.connect(this.mongoURI, function(err, db) {
        if (err) {
            throw new Error(err);
        }
        this.models.pet = db.collection('pets');
        this.models.user = db.collection('users');
        console.log('Connected to database at', this.mongoURI.split('@').pop());

        callback();
    }.bind(this));
};

// Endpoints:
//    GET       /                   Landing page
//    GET       /pets               Get all owner's pets  
//    PATCH     /pets/id            Update the given pets
//    DELETE    /pets/id            Delete the given pets
//    PUT       /pets               Create a new pets
Server.prototype.configureEndpoints = function() {
    // Authentication
    this.app.use(bodyParser());
    this.app.use(cookieParser());
    this.app.use(session({ secret: 'somerandasdfodsecret' }));
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    this.app.get('/auth/google', passport.authenticate('google'));
    this.app.get('/auth/google/return', 
        passport.authenticate('google', {successRedirect: '/pets',
                                         failureRedirect: '/'}));

    // Landing page
    this.app.get('/', function(req, res) {
        // TODO: Send an html page...
        res.sendFile(__dirname+'/index.html');
    });

    // Get index
    this.app.get('/pets', 
        this.ensureAuthenticated,
        this.controllers.pet.index);

    // Update
    this.app.patch('/pets', 
        this.ensureAuthenticated,
        this.controllers.pet.update);

    // Delete
    this.app.delete('/pets',
        this.ensureAuthenticated,
        this.controllers.pet.destroy);

    // Create
    this.app.put('/pets',
        this.ensureAuthenticated,
        this.controllers.pet.create);
};

Server.prototype.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

Server.prototype.start = function(callback) {
    callback = callback || function(){};
    if (this.app) {
        this.app.listen(this.port, function() {
            console.log('App listening on port', this.port);
            callback();
        }.bind(this));
    } else {
        this.onStart = callback;
    }
};

module.exports = Server;
