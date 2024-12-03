var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  if (
    !checkBody(req.body, [
      "nom",
      "prenom",
      "email",
      "numPhone",
      "password",
      "statut",
    ])
  ) {
    // Si un champ est manquant ou vide, on renvoie une réponse d'erreur
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  // vérifier si le mdp est conforme
  if (req.body.password !== req.body.confirmPassword) {
    return res.json({ result: false, error: "Passwords do not match" });
  }

  try {
    // vérifier si l'utilisateur est enregistré en BDD
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        statut: req.body.statut,
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        numPhone: req.body.numPhone,
        password: hash, // hash enregistré à la place de mdp en clair
        confirmPassword: hash,
        token: uid2(32),
        aPropos: "",
        description: "",
        dateNaissance: null,
        city: "",
        photoProfil: "",
        photos: [],
        available: req.body.available,
        options: {
          citySearch: "",
          accommodationType: "",
          duration: "",
          smoke: false,
          animals: false,
          visit: false,
          car: false,
          pool: false,
          prmAccess: false,
          garden: false,
          balcon: false,
        },
      });

      // Sauvegarder le nouvel utilisateur dans la base de données
      const newDoc = await newUser.save();
      // Répondre avec succès et les informations nécessaires
      res.json({
        result: true,
        token: newDoc.token,
        email: newDoc.email,
        statut: newDoc.statut,
        nom: newDoc.nom,
        prenom: newDoc.prenom,
      });
    } else {
      // Si l'utilisateur est déjà en BDD
      res.json({ result: false, error: "User already exists" });
    }
  } catch (error) {
    //Gestion des erreurs
    res.json({ result: false, error: "Servor error" });
  }
});

router.post("/signin", async (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({
      result: false,
      error: "Les champs ne peuvent pas être vides",
    });
  }

  try {
    //Recherche de l'utilisateur dans la base
    const user = await User.findOne({ email: req.body.email });

    //Vérification du mdp
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      // Générer un nouveau token pour cet utilisateur
      const newToken = uid2(32);

      // Mettre à jour et sauvegarde le token dans la BDD
      user.token = newToken;
      try {
        await user.save();
      } catch (saveError) {
        return res.json({
          result: false,
          error: "Erreur lors de la mise à jour du token",
        });
      }

      res.json({
        result: true,
        token: newToken,
        email: user.email,
        statut: user.statut,
        nom: user.nom,
        prenom: user.prenom,
      });
    } else {
      res.json({
        result: false,
        error: "Utilisateur non trouvé ou mot de passe incorrect",
      });
    }
  } catch (error) {
    return res.json({ result: false, error: "Erreur du serveur" });
  }
});

router.get("/hebergeur", async (req, res) => {
  // Utiliser une requête à la base de données pour obtenir les utilisateurs avec le statut "hébergeur"
  try {
    // Utilisation de `select` pour inclure uniquement les champs nécessaires dans la réponse
    const data = await User.find({ statut: "hebergeur" }).select({
      token: 1,
      prenom: 1,
      city: 1,
      description: 1,
      aPropos: 1,
      dateNaissance: 1,
      photos: 1,
      photoProfil: 1,
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des hébergeurs" });
  }
});

router.get("/locataire", async (req, res) => {
  // Utiliser une requête à la base de données pour obtenir les utilisateurs avec le statut "locataire"
  try {
    // Utilisation de `select` pour inclure uniquement les champs nécessaires dans la réponse
    const data = await User.find({ statut: "locataire" }).select({
      token: 1,
      prenom: 1,
      city: 1,
      description: 1,
      aPropos: 1,
      dateNaissance: 1,
      photos: 1,
      photoProfil: 1,
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des locataires" });
  }
});

// Route pour récupérer les informations de l'utilisateur par token
router.get("/:token", async (req, res) => {
  const token = req.params.token;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.json({ message: "Utilisateur non trouvé" });
    }
    // Retourner uniquement les informations nécessaires de l'utilisateur
    const userDetails = {
      prenom: user.prenom,
      description: user.description,
      aPropos: user.aPropos,
      city: user.city,
      photos: user.photos,
      photoProfil: user.photoProfil,
      available: user.available,
    };
    res.json(userDetails);
  } catch (error) {
    console.error(error);
    res.json({
      message:
        "Erreur lors de la récupération des informations de l'utilisateur",
    });
  }
});

router.get("/token/:token", async (req, res) => {
  const token = req.params.token;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.json({
      message:
        "Erreur lors de la récupération des informations de l'utilisateur",
    });
  }
});

module.exports = router;
