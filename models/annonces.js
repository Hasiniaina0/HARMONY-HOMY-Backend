const mongoose = require('mongoose');


const annonceSchema = mongoose.Schema({
 title:String,
 description: String,
 hebergeur: Boolean,
 
});

const Annonce = mongoose.model('annonces', userSchema);

module.exports = User;
