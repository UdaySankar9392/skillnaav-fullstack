const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../../models/webapp-models/PaymentModel"); // Import Payment model
const User = require("../../models/webapp-models/userModel"); // Import User model
require("dotenv").config();

const router = express.Router();
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create Order API
router.post("/order", async (req, res) => {
  try {
    const { amount, currency = "INR", userId, planType, email, duration } = req.body;

    // Validate request body
    if (!amount || isNaN(amount) || amount <= 0 || !duration || isNaN(duration)) {
      return res.status(400).json({ success: false, message: "Invalid amount or duration" });
    }

    const options = {
      amount: amount, // Amount is already in paise (e.g., 1000 for ₹10)
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId, // Include userId in notes
        planType, // Include planType in notes
        email,
        duration, // Include duration in notes
      },
    };

    // Create Razorpay order
    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount, // Return amount in paise
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message || "Unknown error",
    });
  }
});

// 2️⃣ Verify Payment API
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planType, amount, email, duration } = req.body;

    // Validate request body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planType || !amount || !email || !duration) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Verify Razorpay payment signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Calculate premiumExpiration based on duration (in months)
    const premiumExpiration = new Date();
    premiumExpiration.setMonth(premiumExpiration.getMonth() + parseInt(duration)); // Add duration in months

    // Save payment details
    const payment = new Payment({
      userId,
      planType,
      email,
      amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "Success",
      premiumExpiration, // Save calculated expiration date
    });
    await payment.save();

    // Update User's premium status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isPremium: true, premiumExpiration }, // Save expiration in User model
      { new: true }
    );

    res.json({ success: true, message: "Payment verified successfully", user: updatedUser });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
});

// Webhook endpoint
router.post("/razorpay-webhook", async (req, res) => {
  try {
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const rawBody = req.body; // Now using raw JSON body

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(JSON.stringify(rawBody)) // Fix: Use JSON.stringify()
      .digest("hex");

    if (razorpaySignature !== expectedSignature) {
      console.error("❌ Invalid webhook signature");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    console.log("🔹 Webhook event received:", rawBody);

    const eventType = rawBody.event;
    const paymentEntity = rawBody.payload.payment.entity;

    if (!paymentEntity) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const paymentId = paymentEntity.id;
    const userId = paymentEntity.notes?.userId; // Fix: Use optional chaining
    if (!userId) {
      console.error("❌ User ID missing in payment notes");
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    switch (eventType) {
      case "payment.captured":
        console.log(`✅ Payment captured for User: ${userId}, Payment ID: ${paymentId}`);

        // Fix: Prevent updating if already marked "Success"
        const existingPayment = await Payment.findOne({ paymentId });
        if (existingPayment?.status === "Success") {
          console.log("⚠️ Payment already processed");
          return res.status(200).json({ success: true, message: "Payment already processed" });
        }

        await Payment.findOneAndUpdate(
          { paymentId },
          { status: "Success" },
          { new: true }
        );

        await User.findByIdAndUpdate(userId, { isPremium: true });

        break;

      case "payment.failed":
        console.error("❌ Payment failed:", paymentEntity.error_description);
        await Payment.findOneAndUpdate(
          { paymentId },
          { status: "Failed" },
          { new: true }
        );
        break;

      default:
        console.log("⚠️ Unhandled event type:", eventType);
    }

    res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    res.status(500).json({ success: false, message: "Error handling webhook" });
  }
});

// Cron job to handle expired subscriptions
const cron = require("node-cron");
cron.schedule("0 0 * * *", async () => {
  try {
    const currentDate = new Date();

    // Find users whose premiumExpiration date has passed
    const expiredUsers = await User.find({
      isPremium: true,
      premiumExpiration: { $lte: currentDate }, // Check if expiration date is less than or equal to current date
    });

    // Update isPremium to false for expired users
    if (expiredUsers.length > 0) {
      const userIds = expiredUsers.map((user) => user._id);
      await User.updateMany(
        { _id: { $in: userIds } },
        { isPremium: false, premiumExpiration: null } // Reset premium status and expiration date
      );

      console.log(`Updated ${expiredUsers.length} users' premium status to false.`);
    } else {
      console.log("No users with expired subscriptions found.");
    }
  } catch (error) {
    console.error("Error updating premium status:", error);
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


