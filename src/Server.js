'use strict';

var express = require('express'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    hostname = 'localhost';

var Server = function(opts) {
    opts = opts || {};
    this.port = opts.port || 8888;

    // Configure authentication
    passport.use(new GoogleStrategy({
        returnURL: 'http://'+hostname+':'+this.port+'/auth/google/return',
        realm: 'http://'+hostname+':'+this.port
    }, function(identifier, profile, done) {
        console.log('Authenticated! Id:', identifier);
        done();
        //User.findOrCreate({openId: identifier}, function(err, user) {
            //done(err, user);
        //});
    }));

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
        passport.authenticate('google'),
        function(req, res) {
        res.status(200).send('Works!');
    });

    // Update
    this.app.patch('/pets', 
        passport.authenticate('google'),
        function(req, res) {
        // TODO 
    });

    // Delete
    this.app.delete('/pets',
        passport.authenticate('google'),
        function(req, res) {
    });

    // Create
    this.app.put('/pets',
        passport.authenticate('google'),
        function(req, res) {
    });
};

Server.prototype.start = function(callback) {
    callback = callback || function(){};
    this.app.listen(this.port, function() {
        console.log('App listening on port', this.port);
        callback();
    }.bind(this));
};

module.exports = Server;
