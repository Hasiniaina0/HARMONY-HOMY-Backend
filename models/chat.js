const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: String,
  nom: String,
  createdAt: { type: Date, default: Date.now },
  type: String,
  url: String,
});

const chatSchema = mongoose.Schema({
  messages: [messageSchema],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
