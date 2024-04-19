var express = require("express");
var router = express.Router();
require("../models/connection");
const User = require("../models/users");

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

// Rejoindre le chat
router.put("/:token", (req, res) => {
  const token = req.params.token;
  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      // Trigger Pusher que si l'utilisateur est trouvé
      pusher.trigger("chat", "join", { token });

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
router.post("/message", async (req, res) => {
  const message = req.body;
  // ajouter la date au msg
  message.date = new Date();

  if (message.type === "audio") {
    const audioPath = `./tmp/${uniqid()}.m4a`;
    const resultMove = await req.files.audio.mv(audioPath);

    if (!resultMove) {
      const resultCloudinary = await cloudinary.uploader.upload(audioPath, {
        resource_type: "video",
      });
      message.url = resultCloudinary.secure_url;
      fs.unlinkSync(audioPath);
    } else {
      res.json({ result: false, error: resultMove });
      return;
    }
  }

  pusher.trigger("chat", "message", message);

  res.json({ result: true });
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
