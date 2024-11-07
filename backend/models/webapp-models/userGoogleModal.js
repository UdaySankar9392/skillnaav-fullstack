const mongoose = require("mongoose");

const UserGoogleSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  image: {
    type: String,
  },
});

const UserGoogleModel = mongoose.model("social-logins", UserGoogleSchema);

module.exports = UserGoogleModel;
