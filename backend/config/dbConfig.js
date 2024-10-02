const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURL =
      process.env.MONGO_URI ||
      "mongodb+srv://adi:1ACiRJq7FsQgFOtV@cluster0.bt8ym8l.mongodb.net/skillnaav-land";
    await mongoose.connect(mongoURL);
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
