const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  tokens: { type: Object, required: true }, // Store access and refresh tokens
});

module.exports = mongoose.model('Token', tokenSchema);
