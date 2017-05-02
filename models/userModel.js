var mongoose = require('mongoose');
var Schema = mongoose.Schema; // Schema is mongoose method!!!
var bcrypt = require('bcrypt-nodejs');


var UserSchema = new Schema({
    firstName: { type: "String", lowercase: true, required: true, unique: false },
    secondName: { type: "String", lowercase: true, required: true, unique: false },
    email: { type: "String", required: true, unique: true },
    password: { type: "String", required: true },
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

UserSchema.methods.comparePassword = function(password){   // password is actually USER'S PASSWORD
    return bcrypt.compareSync(password, this.password);    // this.password is actually BCRYPT PASSWORD
};

// userSchema.path('email').required(true, 'email is required!');
module.exports = mongoose.model("newUser", UserSchema);



