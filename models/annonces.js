const mongoose = require("mongoose");
const { options } = require("../routes/updates");

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

const annonceSchema = mongoose.Schema({
  options: optionSchema,
  title: String,
  description: String,
  hebergeur: Boolean,
});

const Annonce = mongoose.model("annonces", annonceSchema);

module.exports = Annonce;
