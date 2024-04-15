const mongoose = require("mongoose");
const { token } = require("morgan");

const optionSchema = mongoose.Schema({
  city: String,
  accommodationType: String,
  duration: String,
  smoke: Boolean,
  animals: Boolean,
  visit: Boolean,
  car: Boolean,
  pool: Boolean,
  prmAccess: Boolean,
});

const userSchema = mongoose.Schema({
  option: optionSchema,
  nom: String,
  prenom: String,
  dateNaissance: Date,
  email: String,
  numPhone: Number,
  token: String,
  password: String,
  aPropos: String,
  description: String,
  type: String,
  photo: String,
  city: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
