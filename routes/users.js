var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/signup", (req, res) => {
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
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // vérifier si le mdp est conforme
  if (req.body.password !== req.body.confirmPassword) {
    res.json({ result: false, error: "Passwords do not match" });
    return;
  }

  // vérifier si l'utilisateur est enregistré en BDD
  User.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        statut: req.body.statut,
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        numPhone: req.body.numPhone,
        password: hash,
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

      newUser.save().then((newDoc) => {
        res.json({
          result: true,
          token: newDoc.token,
          email: newDoc.email,
          statut: newDoc.statut,
          nom: newDoc.nom,
          prenom: newDoc.prenom,
        });
      });
    } else {
      // Si l'utilisateur est déjà en BDD
      res.json({ result: false, error: "User already exists" });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        email: data.email,
        statut: data.statut,
        nom: data.nom,
        prenom: data.prenom,
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

router.get("/hebergeur", async (req, res) => {
  // Utilisez une requête à la base de données pour obtenir les utilisateurs avec le statut "hébergeur"
  User.find({ statut: "hebergeur" })
    .select({
      token: 1,
      prenom: 1,
      city: 1,
      description: 1,
      aPropos: 1,
      dateNaissance: 1,
      photos: 1,
      photoProfil: 1,
    })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des hébergeurs" });
    });
});

router.get("/locataire", async (req, res) => {
  // Utilisez une requête à la base de données pour obtenir les utilisateurs avec le statut "hébergeur"
  User.find({ statut: "locataire" })
    .select({
      token: 1,
      prenom: 1,
      city: 1,
      description: 1,
      aPropos: 1,
      dateNaissance: 1,
      photos: 1,
      photoProfil: 1,
    })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des locataires" });
    });
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
