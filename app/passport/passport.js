// var express = require('express');
// var router = express.Router();
// var passport = require('passport');
// var FacebookStrategy = require('passport-facebook').Strategy;
// var newUser = require('../models/userModel');
// var session = require('express-session');



// router.use(passport.initialize());
// router.use(passport.session());
// router.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));

// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function (id, done) {
//     // User.findById(id, function (err, user) {
//     //     done(err, user);
//     // });
// });

// passport.use(new FacebookStrategy({
//     clientID: "1263442703704455",
//     clientSecret: "b1346c64a935d1390417a6a3b13a5555",
//     callbackURL: "http://localhost:3000/auth/facebook/callback",
//     profileFields: ['id', 'displayName', 'photos', 'email']
// },
//     function (accessToken, refreshToken, profile, done) {
//         console.log("FB profile ", profile);
//         // User.findOrCreate(..., function (err, user) {
//         //     if (err) { return done(err); }
//         //     done(null, user);
//         // });
//         done(null, profile); // means that is done, null errors and the profile is the one from facebook
//     }
// ));

// router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }));

// router.get('http://localhost:3000/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));


// module.exports = router;

// // <script>
// //   window.fbAsyncInit = function() {
// //     FB.init({
// //       appId      : '1263442703704455',
// //       cookie     : true,
// //       xfbml      : true,
// //       version    : 'v2.8'
// //     });
// //     FB.AppEvents.logPageView();   
// //   };

// //   (function(d, s, id){
// //      var js, fjs = d.getElementsByTagName(s)[0];
// //      if (d.getElementById(id)) {return;}
// //      js = d.createElement(s); js.id = id;
// //      js.src = "//connect.facebook.net/en_US/sdk.js";
// //      fjs.parentNode.insertBefore(js, fjs);
// //    }(document, 'script', 'facebook-jssdk'));
// // </script>



// // //the response

// // {
// //     status: 'connected',
// //     authResponse: {
// //         accessToken: '...',
// //         expiresIn:'...',
// //         signedRequest:'...',
// //         userID:'...'
// //     }
// // }