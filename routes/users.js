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

  // Check if password and confirmPassword match
  if (req.body.password !== req.body.confirmPassword) {
    res.json({ result: false, error: "Passwords do not match" });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ nom: req.body.nom }).then((data) => {
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
      });

      newUser.save().then((newDoc) => {
        res.json({
          result: true,
          token: newDoc.token,
          email: newDoc.email,
          statut: newDoc.statut,
        });
      });
    } else {
      // User already exists in database
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
      prenom: 1,
      city: 1,
      description: 1,
      aPropos: 1,
      dateNaissance: 1,
      photo: 1,
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
      prenom: 1,
      city: 1,
      description: 1,
      aPropos: 1,
      dateNaissance: 1,
      photo: 1,
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

module.exports = router;
