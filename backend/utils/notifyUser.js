const nodemailer = require("nodemailer");

const notifyUser = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // your email password or app password
    }
  });

  // Define the HTML content with inline CSS
  const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
  <header style="text-alig: center; padding: 20px; background-color: #007bff; color: white; border-radius: 8px 8px 0 0;">
   
    <h1 style="margin: 0; font-size: 24px;">SkillNaav</h1>
    <p style="margin: 5px 0; font-size: 16px;">Your Gateway to Opportunities</p>
  </header>
  <div style="padding: 20px; color: #333;">
    <h3 style="color: #007bff;">Dear User,</h3>
    <p style="font-size: 16px; line-height: 1.5;">${message}</p>
    
    <p style="font-size: 16px; line-height: 1.5;">For more information, please visit us at 
      <a href="https://www.skillnaav.com" style="color: #007bff; text-decoration: none;">SkillNaav</a>.
    </p>
    
    <p style="font-size: 16px; line-height: 1.5;">
      If you have any questions, feel free to reach out to our support team at 
      <a href="mailto:support@skillnaav.com" style="color: #007bff; text-decoration: none;">support@skillnaav.com</a>.
    </p>
  </div>
  <footer style="text-align: center; padding: 10px; background-color: #f8f9fa; color: #555; border-radius: 0 0 8px 8px;">
    <p style="font-size: 14px; margin: 5px 0;">Thank you for being a part of SkillNaav.</p>
    <p style="font-size: 14px; margin: 5px 0;">Best Regards,<br>The SkillNaav Team</p>
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