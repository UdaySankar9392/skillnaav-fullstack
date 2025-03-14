const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    planType: { type: String, required: true },
    amount: { type: String, required: true },
    paymentId: { type: String, required: true },
    orderId: { type: String, required: true },
    status: { type: String, default: "Pending" },
    premiumExpiration: { type: Date }, // 🔹 Added premium expiration field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
