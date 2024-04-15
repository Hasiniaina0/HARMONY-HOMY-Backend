var express = require("express");
var router = express.Router();
var User = require("../models/users");
const bcrypt = require("bcrypt");

require("../models/connection");

router.put("/information", (req, res) => {
  const { nom, prenom, email, numPhone, password } = req.body;
  const hash = password ? bcrypt.hashSync(req.body.password, 10) : undefined;

  // Rechercher l'utilisateur dans la base de données par son nom et prénom
  User.findOneAndUpdate(
    { nom, prenom }, // Critère de recherche
    {
      email,
      numPhone,
      password: hash,
    }, // Nouvelles valeurs à mettre à jour
    { new: true } // Option pour retourner le document mis à jour
  )
    .then((user) => {
      if (!user) {
        console.error(
          "Erreur lors de la mise à jour des informations personnelles de l'utilisateur"
        );
        return res
          .status(500)
          .send(
            "Erreur lors de la mise à jour des informations personnelles de l'utilisateur"
          );
      }
      // Répondre avec un statut de réussite et les données mises à jour de l'utilisateur
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(
        "Erreur lors de la mise à jour des informations personnelles de l'utilisateur :",
        err
      );
      return res
        .status(500)
        .send(
          "Erreur lors de la mise à jour des informations personnelles de l'utilisateur"
        );
    });
});

router.put("/profil", (req, res) => {
  const { nom, prenom, city, aPropos, description } = req.body;

  // Mettre à jour les champs localisation, à propos et description pour tous les utilisateurs avec le même nom et prénom
  User.findOneAndUpdate(
    { nom, prenom }, // Critère de mise à jour
    { city, aPropos, description }, // Nouvelles valeurs à mettre à jour
    { new: true } // Option pour retourner le document mis à jour
  )
    .then((user) => {
      if (!user) {
        console.error(
          "Erreur lors de la mise à jour du profil de l'utilisateur :",
          err
        );
        return res
          .status(500)
          .send("Erreur lors de la mise à jour du profil de l'utilisateur");
      }

      // Répondre avec un statut de réussite
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(
        "Erreur lors de la mise à jour du profil de l'utilisateur :",
        err
      );
      return res
        .status(500)
        .send("Erreur lors de la mise à jour du profil de l'utilisateur");
    });
});
router.put("/options", (req, res) => {
  const {
    nom,
    prenom,
    city,
    accommodationType,
    duration,
    smoke,
    animals,
    visit,
    car,
    pool,
    prmAccess,
  } = req.body;

  // Mettre à jour les champs pour tous les utilisateurs avec le même nom et prénom
  User.findOneAndUpdate(
    { nom: nom, prenom: prenom }, // Critère de mise à jour
    {
      city,
      accommodationType,
      duration,
      smoke,
      animals,
      visit,
      car,
      pool,
      prmAccess,
    }, // Nouvelles valeurs à mettre à jour
    { new: true } // Option pour retourner le document mis à jour
  )
    .then((user) => {
      if (!user) {
        console.error(
          "Erreur lors de la mise à jour des options de l'utilisateur"
        );
        return res
          .status(500)
          .send("Erreur lors de la mise à jour des options de l'utilisateur");
      }

      // Répondre avec un statut de réussite
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(
        "Erreur lors de la mise à jour des options de l'utilisateur"
      );
      return res
        .status(500)
        .send("Erreur lors de la mise à jour des options de l'utilisateur");
    });
});

module.exports = router;
