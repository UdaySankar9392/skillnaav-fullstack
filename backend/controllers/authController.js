const UserGoogleModel = require("../models/webapp-models/userGoogleModal");
const { oauth2client } = require("../utils/googleConfig");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;

    // Exchange code for tokens
    const { tokens } = await oauth2client.getToken(code);
    oauth2client.setCredentials(tokens);

    // Retrieve user information
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );
    const { email, name, picture } = userRes.data;

    // Check if user exists, else create a new user
    let user = await UserGoogleModel.findOne({ email });
    if (!user) {
      user = await UserGoogleModel.create({
        name,
        email,
        image: picture,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TIMEOUT,
    });

    // Respond with token and user data
    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Error during Google login:", error);
    res
      .status(500)
      .json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = { googleLogin };
