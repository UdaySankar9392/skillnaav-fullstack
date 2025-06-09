const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getAccessToken } = require("../../utils/paypal");
const Payment = require("../../models/webapp-models/PaymentModel");
const User = require("../../models/webapp-models/userModel");

// Create PayPal order
router.post("/paypal/order", async (req, res) => {
  const { amount, userId, planType, email, duration } = req.body;
  if (!amount || !userId || !planType || !email || !duration)
    return res.status(400).json({ success: false, message: "Missing required fields" });

  try {
    const accessToken = await getAccessToken();
    const value = parseFloat(amount).toFixed(2); // Always ensure string with two decimals

    const response = await axios.post(
      `${process.env.PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value,
          }
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, id: response.data.id });
  } catch (err) {
    if (err.response) {
      console.error("❌ Error creating PayPal order:", err.response.data);
      res.status(500).json({ success: false, message: "Error creating order", details: err.response.data });
    } else {
      console.error("❌ Error creating PayPal order:", err.message);
      res.status(500).json({ success: false, message: "Error creating order", details: err.message });
    }
  }
});

// Verify and capture payment
router.post("/paypal/verify", async (req, res) => {
  const { orderID, userId, planType, amount, email, duration } = req.body;
  if (!orderID || !userId || !planType || !amount || !email || !duration) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const accessToken = await getAccessToken();

    const capture = await axios.post(
      `${process.env.PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const premiumExpiration = new Date();
    premiumExpiration.setMonth(premiumExpiration.getMonth() + parseInt(duration));

    const payment = new Payment({
      userId,
      planType,
      email,
      amount: amount.toString(),
      paymentId: orderID,
      orderId: orderID,
      status: "Success",
      premiumExpiration,
    });
    await payment.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isPremium: true, premiumExpiration },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    if (err.response) {
      console.error("❌ FULL ERROR in /paypal/verify:", err.response.data);
      return res.status(500).json({
        success: false,
        message: err.message,
        details: err.response.data,
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message,
      details: null,
    });
  }
});

module.exports = router;



// 3️⃣ Get Payment Status API (Optional)
// router.get("/status/:paymentId", async (req, res) => {
//   try {
//     const { paymentId } = req.params;
//     const payment = await Payment.findOne({ paymentId });

//     if (!payment) {
//       return res.status(404).json({ success: false, message: "Payment not found" });
//     }

//     res.json({ success: true, payment });
//   } catch (error) {
//     console.error("Error fetching payment status:", error);
//     res.status(500).json({ success: false, message: "Error fetching payment status" });
//   }
// });


