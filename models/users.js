const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
 name: String,
 firstname: String,
 dateNaissance: Date,
 email: String,
 phoneNumber: Number,
 password: String,
 aPropos: String,
 description:String,
 type: String,
 photo: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;
