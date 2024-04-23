var express = require("express");
var router = express.Router();
require("../models/connection");

const Chat = require("../models/chat");

const Pusher = require("pusher");
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Création du chat
router.post("/create", (req, res) => {
  const { tokens } = req.body;
  Users.find({ token: tokens[0] || tokens[1] }).then((users) => {
    const userIds = users.map((user) => user._id);
    const newChat = new Chat({
      messages: [],
      users: userIds,
    });
    newChat.save().then((savedChat) => {
      if (savedChat) {
        pusher.trigger("chat", "join", { tokens });
        return { result: true, message: "chat enregistré", savedChat };
      } else {
        return res.json({
          result: false,
          message: "error lors de l'enregistrement du message",
        });
      }
    });
  });
});

// Rejoindre le chat
router.put("/:token", (req, res) => {
  const token = req.params.token;
  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      // Trigger Pusher que si l'utilisateur est trouvé
      pusher.trigger("chat", "message", { token });

      res.json({ result: true });
    })
    .catch((error) => {
      console.error("Erreur lors de la recherche de l'utilisateur :", error);
      res.status(500).json({
        message: "Erreur serveur lors de la recherche de l'utilisateur",
      });
    });
});

// Quitter le chat
router.delete("/:token", (req, res) => {
  const token = req.params.token;
  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      pusher.trigger("chat", "leave", { token });

      res.json({ result: true });
    })
    .catch((error) => {
      console.error("Erreur lors de la recherche de l'utilisateur :", error);
      res.status(500).json({
        message: "Erreur serveur lors de la recherche de l'utilisateur",
      });
    });
});

// Envoyer un message
router.post("/:chatId/messages", async (req, res) => {
  const { chatId } = req.params;
  const { text, type, nom } = req.body;

  const messageData = {
    text,
    nom,
    createdAt: new Date(),
  };

  if (type === "audio" && req.files && req.files.audio) {
    const audioPath = `./tmp/${uniqid()}.m4a`;
    const moveResult = await req.files.audio.mv(audioPath);

    if (moveResult) {
      res.status(500).json({ result: false, error: moveResult });
      return;
    }

    const cloudinaryResult = await cloudinary.uploader.upload(audioPath, {
      resource_type: "video",
    });
    messageData.url = cloudinaryResult.secure_url;
    fs.unlinkSync(audioPath);
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404).json({ result: false, message: "Chat non trouvé" });
    return;
  }

  chat.messages.push(messageData);

  chat
    .save()
    .then((savedChat) => {
      if (savedChat) {
        // Déclencher un événement Pusher sur le canal de ce chat
        pusher.trigger(`chat_${chatId}`, "message", messageData);

        res.json({
          result: true,
          message: "Message envoyé et sauvegardé",
          savedChat,
        });
      } else {
        res
          .status(500)
          .json({
            result: false,
            message: "Erreur lors de l'enregistrement du message",
          });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la sauvegarde du message :", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

// récupérer tous les messages
router.get("/messages/:token", async (req, res) => {
  const token = req.params.token;
  const user = User.findOne({ token });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  //obtenir tous les messages échangés
  const messages = user.chat;

  // Répondre avec une réponse JSON contenant tous les messages récupérés
  res.status(200).json(messages);
});
//   .catch((error) => {
//     console.error("Erreur lors de la recherche de l'utilisateur :", error);
//     res.status(500).json({
//       message: "Erreur serveur lors de la recherche de l'utilisateur",
//     });
//   });

module.exports = router;
