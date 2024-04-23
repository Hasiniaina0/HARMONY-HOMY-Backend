var express = require("express");
var router = express.Router();
var User = require("../models/users");
const bcrypt = require("bcrypt");

require("../models/connection");

const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// envoyer les photos sur cloudinary
router.post("/photos/:token", async (req, res) => {
  console.log(req.files);
  const files = req.files;
  const photos = [];
  for (const photo in files) {
    console.log("photo:", photo);
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await files[photo].mv(photoPath);

    if (!resultMove) {
      const resultCloudinary = await cloudinary.uploader.upload(photoPath);
      photos.push(resultCloudinary.secure_url);
      User.findOneAndUpdate(
        { token: req.params.token },
        { photos }, // Nouvelles valeurs à mettre à jour
        { new: true } // Option pour retourner le document mis à jour
      )
        .then((user) => {
          if (!user) {
            console.error(
              "Erreur lors de la mise à jour des photos de l'utilisateur : utilisateur non trouvé"
            );
            return res
              .status(500)
              .send(
                "Erreur lors de la mise à jour des photos de l'utilisateur: utilisateur non trouvé"
              );
          }

          // Répondre avec un statut de réussite
          res.status(200).json(user);
        })
        .catch((err) => {
          console.error(
            "Erreur lors de la mise à jour des photos de l'utilisateur ",
            err
          );
          return res
            .status(500)
            .send("Erreur lors de la mise à jour des photos de l'utilisateur");
        });
    } else {
      res.json({ result: false, error: resultMove });
    }
    fs.unlinkSync(photoPath);
  }
});

// envoyer la photo de profil sur cloudinary
router.post("/photoProfil/:token", async (req, res) => {
  console.log(req.files);
  const files = req.files;
  const photoProfil = [];
  for (const photo in files) {
    console.log("photo de profil:", photo);
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await files[photo].mv(photoPath);

    if (!resultMove) {
      const resultCloudinary = await cloudinary.uploader.upload(photoPath);
      photoProfil.push(resultCloudinary.secure_url);
      User.findOneAndUpdate(
        { token: req.params.token },
        { photoProfil }, // Nouvelles valeurs à mettre à jour
        { new: true } // Option pour retourner le document mis à jour
      )
        .then((user) => {
          if (!user) {
            console.error(
              "Erreur lors de la mise à jour des photos de l'utilisateur : utilisateur non trouvé"
            );
            return res
              .status(500)
              .send(
                "Erreur lors de la mise à jour des photos de l'utilisateur: utilisateur non trouvé"
              );
          }

          // Répondre avec un statut de réussite
          res.status(200).json(user);
        })
        .catch((err) => {
          console.error(
            "Erreur lors de la mise à jour des photos de l'utilisateur ",
            err
          );
          return res
            .status(500)
            .send("Erreur lors de la mise à jour des photos de l'utilisateur");
        });
    } else {
      res.json({ result: false, error: resultMove });
    }
    fs.unlinkSync(photoPath);
  }
});

router.put("/information", (req, res) => {
  const { token, email, numPhone, password } = req.body;
  const hash = password ? bcrypt.hashSync(req.body.password, 10) : undefined;

  // Rechercher l'utilisateur dans la base de données par son nom et prénom
  User.findOneAndUpdate(
    { token },
    { email, numPhone, password: hash }, // Nouvelles valeurs à mettre à jour
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

//Récupération du profil utilisateur
router.put("/profil", (req, res) => {
  const { token, city, aPropos, description } = req.body;

  // Mettre à jour les champs localisation, à propos et description pour tous les utilisateurs avec le même nom et prénom
  User.findOneAndUpdate(
    { token },
    { city, aPropos, description }, // Nouvelles valeurs à mettre à jour
    { new: true } // Option pour retourner le document mis à jour
  )
    .then((user) => {
      if (!user) {
        console.error(
          "Utilisateur non trouvé lors de la mise à jour du profil."
        );
        // Envoyer une réponse et quitter la fonction
        res.status(404).json({ error: "Utilisateur non trouvé." });
        return; // Ce "return" est important pour éviter les doubles réponses
      }

      // Si la mise à jour réussit, renvoyer l'utilisateur mis à jour
      res.status(200).json(user); // Envoyer la réponse
    })
    .catch((err) => {
      console.error("Erreur lors de la mise à jour du profil :", err);
      res.status(500).json({ error: "Erreur interne du serveur." }); // Envoyer la réponse
    });
});

router.put("/options", (req, res) => {
  const {
    token,
    citySearch,
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
    { token }, // Critère de mise à jour
    {
      citySearch,
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
