'use strict';

var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    engines = require('consolidate'),
    session = require('express-session'),
    async = require('async'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth2').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    FacebookTokenStrategy = require('passport-facebook-token').Strategy,

    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,

    PetController = require('./PetController'),
    UserController = require('./UserController'),
    hostname = process.env.HOST || 'localhost';

var Server = function(opts) {
    opts = opts || {};
    this.port = opts.port || 8888;
    this.mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/homeward-bound';

    // Configure Models
    this.models = {
        pet: null,
        user: null,
        location: null
    };

    this.configureModels(function() {
        // Configure Controllers
        this.controllers = {
            pet: new PetController(this.models.user, this.models.pet, this.models.location),
            user: new UserController(this.models.user, this.models.pet, this.models.location)
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
        console.log('User is', user);
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        this.models.user.findOne({_id: ObjectID(id)}, function(err, user) {
            done(err, user);
        });
    }.bind(this));

    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://'+hostname+'/auth/google/return',
        passReqToCallback: true
    }, function(request, accessToken, profile, done) {
        // Find the user or create the user
        this.models.user.findOne({accountId: profile.id, 
                                  accountType: 'Google'}, /*{limit: 1},*/ function(err, user) {
            if (!user) {
                this.models.user.insert({accountId: profile.id, 
                                         accountType: 'Google',
                                         email: profile.emails[0].value},  // First email
                                         function(err, res) {
                    done(err, res[0]);
                }.bind(this));
            } else {
                done(err, user);
            }
        }.bind(this));
    }.bind(this)));

    // Facebook
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://'+hostname+'/auth/facebook/return',
        passReqToCallback: true
    }, this.findOrCreateFacebookUser.bind(this)));

    // Mobile Auth
    passport.use(new FacebookTokenStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }, this.findOrCreateFacebookUser.bind(this)));

};

Server.prototype.findOrCreateFacebookUser = function(token, accessToken, refreshToken, profile, done) {
    // Find the user or create the user
    // Check vars
    console.log('profile is:', Object.keys(profile));

    this.models.user.findOne({accountId: profile.id,
                              accountType: 'Facebook'}, /*{limit: 1},*/ function(err, user) {
        if (!user) {
            this.models.user.insert({accountId: profile.id,
                                     accountType: 'Facebook',
                                     email: profile.emails[0].value},  // First email
                                     function(err, res) {
                done(err, res[0]);
            }.bind(this));
        } else {
            done(err, user);
        }
    }.bind(this));
};

Server.prototype.configureModels = function(callback) {
    MongoClient.connect(this.mongoURI, function(err, db) {
        if (err) {
            throw new Error(err);
        }
        this.models.pet = db.collection('pets');
        this.models.user = db.collection('users');
        this.models.location = db.collection('locations');
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
    this.app.use(bodyParser.json({extended: true}));
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(cookieParser());
    this.app.use(session({resave: false, 
                          saveUninitialized: false,
                          secret: 'somerandasdfodsecret'}));
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // Google
    this.app.get('/auth/google', passport.authenticate('google',
        { scope: [
            'https://www.googleapis.com/auth/userinfo.email'  // Get the email address
        ]}
    ));

    this.app.get('/auth/google/return',
        passport.authenticate('google', {successRedirect: '/dashboard',
                                         failureRedirect: '/'})
    );

    // Facebook
    this.app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
    this.app.get('/auth/facebook/return', 
        passport.authenticate('facebook', {successRedirect: '/dashboard',
                                           failureRedirect: '/'})
    );
    // Mobile Auth
    this.app.post('/auth/facebook/token',
                 passport.authenticate('facebook-token', { scope: ['email'] }),
                 function(req, res) {
                     if (req.user) {
                         console.log('Authenticated user with a token!');
                         res.send(200);
                     }
                     console.log('Could not authenticate user with a token!');
                     res.send(400);
                 });


    // Views settings
    this.app.set('views', __dirname + '/../client');
    this.app.use(express.static(__dirname + '/../client'));
    this.app.engine('html', engines.mustache);
    this.app.set('view engine', 'html');
    // Landing page
    this.app.get('/', function(req, res) {
        res.render('/index');
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

    // User dashboard
    this.app.get('/dashboard',
        this.ensureAuthenticated,
        function(req, res) {
            res.render('dashboard');
        });
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
