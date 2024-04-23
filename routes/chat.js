var express = require("express");
var router = express.Router();
require("../models/connection");

const Chat = require("../models/chat");
const User = require("../models/users");

router.get("/auth-key", (req, res) => {
  try {
    const userId = req.userId;

    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({
        result: false,
        message: "Utilisateur non trouvé",
      });
    }
    // Logique pour générer la clé d'authentification pour PubNub
    const authKey = generateAuthKey(user);
    return res.status(200).json({
      result: true,
      authKey,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la clé d'authentification:",
      error
    );
    return res.status(500).json({
      result: false,
      message: "Erreur serveur",
    });
  }
});

module.exports = router;
