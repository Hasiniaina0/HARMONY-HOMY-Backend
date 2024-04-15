const mongoose = require("mongoose");

<<<<<<< Updated upstream
const connectionString = process.env.CONNECTION_STRING;
=======
const connectionString = process.env.CONNECTION_STRING ;
>>>>>>> Stashed changes

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));
