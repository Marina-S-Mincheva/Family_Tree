var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var newUser = require('../models/userModel');
var jwt = require('jsonwebtoken');
var secret = "familytree";  // pass for jwt
// var multer = require('multer');
// var upload = multer({ dest: '../app/uploads/' });

// USER REGISTRATION
router.post('/register', function(req, res, next) {
    var user = new newUser();
    user.firstName = req.body.firstName;
    user.secondName = req.body.secondName;
    user.email = req.body.email;
    user.password = req.body.password;
    if (req.body.firstName == null || req.body.firstName == "" || req.body.secondName == null || req.body.secondName == "" ||
        req.body.email == null || req.body.email == "" || req.body.password == null || req.body.password == "") {
        res.json({ success: false, message: "Ensure names, e-mail and password are provided!" });
    } else {
        user.save(function(err) {
            if (err) {
                if (err.errors != null) {       // to be sure no dublicate register forms
                    if (err.errors.firstName) {
                        res.json({ success: false, message: err.errors.firstName.message });
                    } else if (err.errors.secondName) {
                        res.json({ success: false, message: err.errors.secondName.message });
                    } else if (err.errors.email) {
                        // console.log("email err ", err);
                        res.json({ success: false, message: err.errors.email.message });
                    } else if (err.errors.password) {
                        res.json({ success: false, message: err.errors.password.message });
                    } else {
                        res.json({ success: false, message: err }); // just to catch errors
                    }
                } else if (err) {  // cheking for dublications!!!!!!!!!!!!!!!!!!!!!
                    if (err.code === 11000) {
                        res.json({ success: false, message: "E-mail is already taken!"});
                    } else {
                        res.json({ success: false, message: err }); // just to catch errors
                    }
                }
            } else {
                var token = jwt.sign({ // token when password is valid we create the TOKEN
                    email: user.email            // this is the data we want to incrypt to the token and pass to the client, and in fron end we can decrypt it!!!!! BUT NO SENSITIVE INFORMATION
                }, secret, { expiresIn: "24h" });
                res.json({ success: true, message: "User is created!", token: token });
            }
        });
    };
});

//USER LOGIN AND ON SUCCESS GIVE HIM TOKEN
router.post('/login', function(req, res, next) {
    newUser.findOne({ email: req.body.email }).select('email tree password').exec(function(err, user) {
        console.log("userrr  ", user);    // it returns:  _id, password and email
        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: "Could not authenticate user!" });
        } else if (user) {
            if (req.body.password) {
                var validPass = user.comparePassword(req.body.password);
            } else {
                res.json({ success: false, message: "No password provided!" });
            }
            // console.log("req.body.password ", req.body.password);
            if (!validPass) {
                res.json({ success: false, message: "Password is not valid!" });
            } else {
                var token = jwt.sign({ // token when password is valid we create the TOKEN
                    email: user.email            // this is the data we want to incrypt to the token and pass to the client, and in fron end we can decrypt it!!!!! BUT NO SENSITIVE INFORMATION
                }, secret, { expiresIn: "1h" });
                res.json({ tree: user.tree, email: user.email, success: true, message: "Correct!", token: token }); // second token is from the var ;)
            }
        }
    });
});


// GET USER'S TOKEN - middleware
router.use(function(req, res, next) {
    var getToken = req.body.token || req.body.query || req.headers['x-access-token']; 

    //VERIFY THE TOKEN
    if (getToken) {
        jwt.verify(getToken, secret, function(err, decoded) {
            if (err) {      // if occures an error, means that token was not verified!!!!!!!!!!(if the token expires after 24 hours)
                console.log("err when verifying  ", err);
                res.json({ success: false, message: "Token invalid!" });
            } else {
                // assign the token to a local variable and pass it to another router
                req.decoded = decoded; // decoded means that it send back the email (from login)
                next();
            }
        })
    } else {
        res.json({ success: false, message: "No token provided!" });
    }
});


router.post('/me', function(req, res) {
    res.send(req.decoded);
    console.log("req decoded ", req.decoded);
});



// UPLOUDING IMAGES
// router.post('/dashboard', upload.single('usersFile'), function(req, res, next) {
//      console.log("test uploading file " + JSON.stringify(req.file));
// });


module.exports = router; //to access from other files
