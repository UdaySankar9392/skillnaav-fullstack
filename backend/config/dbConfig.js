// const mongoose = require("mongoose");
// const mongo_url =
//   "mongodb+srv://adi:1ACiRJq7FsQgFOtV@cluster0.bt8ym8l.mongodb.net/skillnaav-land";
// mongoose.connect(process.env.mongo_url || mongo_url);

// const connection = mongoose.connection;

// connection.on("error", () => {
//   console.log("Error connecting to database");
// });

// connection.on("connected", () => {
//   console.log("MongoDB connection successful");
// });

// module.exports = connection;

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
