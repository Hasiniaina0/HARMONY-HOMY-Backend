const mongoose = require("mongoose");
const { token } = require("morgan");

const userSchema = mongoose.Schema({
  name: String,
  firstname: String,
  dateNaissance: Date,
  email: String,
  phoneNumber: Number,
  token: String,
  password: String,
  aPropos: String,
  description: String,
  type: String,
  photo: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
