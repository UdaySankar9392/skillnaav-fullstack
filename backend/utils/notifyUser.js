// utils/notifyUser.js
const nodemailer = require("nodemailer");

const notifyUser = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "skillnaav@gmail.com",
      pass: "zpgj miwi xucy bwrs" // your email password or app password
    }
  });

  // Define the HTML content with inline CSS
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <header style="text-align: center; padding: 10px; background-color: #007bff; color: white; border-radius: 5px 5px 0 0;">
        <h2>SkillNaav</h2>
      </header>
      <div style="padding: 20px; color: #333;">
      
        <h3 style="color: #007bff;">Hello,</h3>
        <p style="font-size: 16px;">${message}</p>
        <p style="font-size: 16px;">You can visit us at <a href="https://www.skillnaav.com" style="color: #007bff;">https://www.skillnaav.com</a> for more information.</p>
        <p style="font-size: 14px; color: #555;">If you have any questions, feel free to reach out to us at <a href="mailto:support@skillnaav.com" style="color: #007bff;">support@skillnaav.com</a>.</p>
      </div>
      <footer style="text-align: center; padding: 10px; background-color: #f8f9fa; color: #555; border-radius: 0 0 5px 5px;">
        <p style="font-size: 14px;">Thank you,<br>SkillNaav Team</p>
      </footer>
    </div>
  `;

  const mailOptions = {
    from: "skillnaav@gmail.com",
    to: email,
    subject: subject,
    html: htmlContent // Send HTML content in the email
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = notifyUser;