// utils/notifyUser.js
const nodemailer = require("nodemailer");

const notifyUser = async (email, subject, message) => {
  // Create a transporter using your email service
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your email service provider
    auth: {
      user: "gundapanenilavanya33@gmail.com", // your email
      pass: "bbqi fadm koxj yhyz" // your email password or app password
    }
  });

  const mailOptions = {
    from: "gundapanenilavanya33@gmail.com",
    to: email,
    subject: subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = notifyUser;
