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

router.put("/information", (req, res) => {
  const { userId: token, email, numPhone, password } = req.body;
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

router.put("/profil", (req, res) => {
  const { token, city, aPropos, description, numPhone, password, email } =
    req.body;

  // Mettre à jour les champs localisation, à propos et description pour tous les utilisateurs avec le même nom et prénom
  User.findOneAndUpdate(
    { token },
    { city, aPropos, description, numPhone, password, email }, // Nouvelles valeurs à mettre à jour
    { new: true } // Option pour retourner le document mis à jour
  )
    .then((user) => {
      if (!user) {
        console.error(
          "Erreur lors de la mise à jour du profil de l'utilisateur :"
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
    userId,
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
    { _id: userId }, // Critère de mise à jour
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
