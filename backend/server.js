const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/dbConfig");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

dotenv.config(); // Load environment variables

const app = express(); // Initialize express app

// MongoDB Connection
connectDB(); // Establish MongoDB connection

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS

// Routes
const userRoutes = require("./routes/webapp-routes/userRoutes");
const skillnaavRoute = require("./routes/skillnaavRoute");

// Define routes
app.use("/api/users", userRoutes); // User routes
app.use("/api/skillnaav", skillnaavRoute); // Skillnaav routes
app.use("/api/contact", skillnaavRoute); // Contact route (Verify if this is correct)

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
