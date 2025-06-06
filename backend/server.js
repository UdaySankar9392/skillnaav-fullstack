const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const axios = require("axios"); // Add axios for making HTTP requests
const connectDB = require("./config/dbConfig");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const cron = require("node-cron");
const checkPremiumExpiration = require("./utils/checkpremiumExipiration");

// Load environment variables
dotenv.config();

const app = express(); // Initialize express app

// MongoDB Connection
connectDB(); // Establish MongoDB connection

// Middleware
app.use(express.json()); // For parsing application/json

app.use(
  cors({
    origin: "*", // or specify your front-end origin
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Routes
const userRoutes = require("./routes/webapp-routes/userRoutes");
const internRoutes = require("./routes/webapp-routes/internshipPostRoutes");
const skillnaavRoute = require("./routes/skillnaavRoute");
const partnerRoutes = require("./routes/webapp-routes/partnerRoutes"); // Import Partner routes
const adminRoutes = require("./routes/webapp-routes/adminRoutes"); // Import Admin routes
const chatRoutes = require("./routes/webapp-routes/ChatRoutes");
const googleUserRoutes = require("./routes/webapp-routes/GoogleUserRoutes"); // Import Google User routes
const applicationRoutes = require("./routes/webapp-routes/applicationRoutes"); // Import Application routes
const savedJobRoutes = require("./routes/webapp-routes/SavedJobRoutes");

const personalityRoutes = require("./routes/webapp-routes/PersonalityRoutes"); // Import Personality routes
const paymentRoutes = require("./routes/webapp-routes/paymentRoutes"); // Import Payment routes


// Import Personality routes
const personalityRoutes = require("./routes/webapp-routes/PersonalityRoutes"); // Import Personality routes


// Define routes
app.use("/api/users", userRoutes); // User Web App routes
app.use("/api/interns", internRoutes); // Partner to Admin Intern Posts
app.use("/api/skillnaav", skillnaavRoute); // Skillnaav routes
app.use("/api/contact", skillnaavRoute); // Contact route (Verify if this is correct)
app.use("/api/partners", partnerRoutes); // Partner routes for registration and login
app.use("/api/admin", adminRoutes); // Admin Web app Routes
app.use("/api/chats", chatRoutes); // Chat routes
app.use("/api/google-users", googleUserRoutes); // Google User routes
app.use("/api/applications", applicationRoutes); // Application routes (this should now work)
app.use("/api/savedJobs", savedJobRoutes);

app.use("/api/personality", personalityRoutes); // Personality related routes
app.use("/api/payments", paymentRoutes); // Payment routes
app.use(
  "/api/payments/razorpay-webhook",
  express.raw({ type: "application/json" })
);


// New route for skill gap analysis
app.post("/api/analyze-skills", async (req, res) => {
  console.log("Received request:", req.body); // Log incoming request
  try {
      const response = await axios.post("http://localhost:8000/api/analyze-skills", req.body);
      res.json(response.data);
  } catch (error) {
      console.error("Error from FastAPI:", error.response?.data || error.message);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// Add Personality routes for handling questions and responses
app.use("/api/personality", personalityRoutes); // Personality related routes

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

app.listen(PORT,'0.0.0.0',() => {

  console.log(`Server running on port ${PORT}`);
});