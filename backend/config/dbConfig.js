  const mongoose = require("mongoose");
  const mongo_url =
    "mongodb+srv://adi:1ACiRJq7FsQgFOtV@cluster0.bt8ym8l.mongodb.net/skillnaav-land";
  mongoose.connect(process.env.mongo_url || mongo_url);

  const connection = mongoose.connection;

  connection.on("error", () => {
    console.log("Error connecting to database");
  });

  connection.on("connected", () => {
    console.log("MongoDB connection successful");
  });

  module.exports = connection;
