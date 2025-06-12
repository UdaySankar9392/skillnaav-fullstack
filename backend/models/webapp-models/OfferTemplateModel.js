const mongoose = require("mongoose");

const offerTemplateSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partner",
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String, required: true }, // HTML or text with placeholders
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OfferTemplate", offerTemplateSchema);
