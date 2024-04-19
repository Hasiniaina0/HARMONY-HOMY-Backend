const mongoose = require("mongoose");

const optionSchema = mongoose.Schema({
  citySearch: String,
  accommodationType: String,
  duration: String,
  smoke: Boolean,
  animals: Boolean,
  visit: Boolean,
  car: Boolean,
  pool: Boolean,
  prmAccess: Boolean,
  garden: Boolean,
  balcon: Boolean,
});

const userSchema = mongoose.Schema({
  options: optionSchema,
  nom: String,
  prenom: String,
  dateNaissance: Date || null,
  email: String,
  numPhone: Number,
  token: String,
  password: String,
  aPropos: String,
  description: String,
  statut: String,
  photos: [String],
  city: String,

  chat: {
    message: String,
    date: Date,
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
