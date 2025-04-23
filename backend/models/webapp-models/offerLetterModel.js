// models/OfferLetter.js
const mongoose = require("mongoose");

const offerLetterSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyName: String,
  location: String,
  duration: String,
  stipend: {
    amount: Number,
    currency: String,
    frequency: String
  },
  jobDescription: String,
  qualifications: [String],
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },
  status: { type: String, default: "sent" },
  sentDate: { type: Date, default: Date.now },

  // ✅ Add this:
  s3Url: { type: String }
});


module.exports = mongoose.model("OfferLetter", offerLetterSchema);