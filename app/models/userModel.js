var mongoose = require('mongoose');
var Schema = mongoose.Schema; // Schema is mongoose method!!!
var bcrypt = require('bcrypt-nodejs');
var validate = require('mongoose-validator');
// var titlize = require('mongoose-title-case');

var namesValidator = [
    validate({                  // it says: this field must have these specific characters
        validator: 'matches',
        arguments: /^([a-zA-Z]{2,10})+$/,
        message: "Names must contain at least 3 characters, max 20, and no special symbols or numbers!"
    })
];


var emailValidator = [
    validate({
        validator: 'isEmail',
        message: "Is not a valid email!"
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 50],
        message: 'E-mail should be between {ARGS[0]} and {ARGS[1]} characters!'
    })
];

var passwordValidator = [
    validate({
        validator: 'isLength',
        arguments: [8],
        message: 'Password should be at least {ARGS[0]} characters!'
    })
];
var UserSchema = new Schema({
    firstName: { type: "String", required: true, unique: false, validate: namesValidator },
    secondName: { type: "String", required: true, unique: false, validate: namesValidator },
    email: { type: "String", required: true, unique: true, lowercase: true, validate: emailValidator },
    password: { type: "String", required: true, validate: passwordValidator },
    tree: []
});

UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function (password) {   // password is actually USER'S PASSWORD
    return bcrypt.compareSync(password, this.password);    // this.password is actually BCRYPT PASSWORD
};

module.exports = mongoose.model("newUser", UserSchema);


 
