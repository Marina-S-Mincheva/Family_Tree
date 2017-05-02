var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var newUser = require('./app/models/userModel');
// var multer = require('multer');
// var upload = multer({ dest: '/uploads'});
// var passport = require('passport');
// var facebook = require('./app/passport/passport');
var mongodb = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/familytree');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/familytree', function (err) {
  if (err) {
    console.log("Not connected to the database: " + err);
  } else {
    console.log("Successfully connected to the database");
  }
});
// var db = mongoose.connection;





var users = require('./app/routes/users');
var theTree = require('./app/routes/theTree');


var app = express();

app.use(function(req, res, next) {  
    req.db = db; 
    next();
})

// "Can't set headers after they are sent" error in the console BECAUSE ----->(In this configuration, res.render and res.json will both call res.end() which is basically like trying to send a response twice to the client.)!!!!!!!!!!
app.use(function(req,res,next){ 
    var _send = res.send;
    var sent = false;
    res.send = function(data){
        if(sent) return;
        _send.bind(res)(data);
        sent = true;
    };
    next();
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }, {limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// function requireLogin(req, res, next) { 
//   if (req.session.userId != undefined) {
//     next();
//   } else {
//     res.redirect('/login');
//   }
// }




app.use('/users', users);
app.use('/theTree', theTree);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.sendfile(filename.html)
  res.status(err.status || 500);
  res.render('error');
  
});

module.exports = app;
