var express = require('express');
var router = express.Router();
var monk = require('monk');
var db = monk('localhost:27017/familytree');
// var mongoose = require('mongoose');
var newUser = require('../models/userModel');
var jwt = require('jsonwebtoken');
var secret = "familytree";  // pass for jwt
var multer = require('multer');
var upload = multer({ dest: '/uploads' });
router.use(function (req, res, next) {  // създаваме рефереция към обектът db, написан по-горе (var db = .....)
    req.db = db; // ако обичаш, в requesta, в поленцето db, сложи(=) db :))))))
    next();
})


router.post('/dashboard', function (req, res, next) {
    // console.log("wleze222 1", req.body);
    var array = req.body;
    var email = array[array.length - 1].email;
    var pureArray = array.splice(-1, 1);
    // console.log("email ", email);
    var users = req.db.get('newusers');
    users.findOne({ email: email }).then(function (data, err) {
        if (err) {
            res.json({ success: false, message: "Tree is not saved!" });
        } else {
        } if (data) {
            users.update({ _id: data._id }, { $set: { tree: array } }).then(function (succ) {
                if (succ)
                    // res.send(array);
                    res.json({ tree: array, success: true, message: "Tree is saved!" });
            })
        }
    });
});



router.get('/dashboard', function (req, res, next) {
    var allTrees = req.db.get('newusers');
    allTrees.aggregate([{ $project: {"tree": 1 }}]).then(function (data) {
        res.send(data);
    });
});

// router.get('/dashboard/tree', function (req, res, next) {
//     // console.log("req.body GET ", req.body);
//     // var body = req.body;
//     // var email = array[array.length - 1].email;
//     // var pureArray = array.splice(-1, 1);
//     // console.log("body request ", body);
//     var allTrees = req.db.get('newusers');
//     allTrees.aggregate([{ $project: {"tree": 1 }}]).then(function (data) {
//         res.send(data);
//         // console.log("send DATA ", data);
//     });
// });



module.exports = router;