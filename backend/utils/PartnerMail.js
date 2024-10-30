const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: "skillnaav@gmail.com",
    pass: "zpgj miwi xucy bwrs",
  },
});

const sendEmail = (to, subject, internship) => {
  const emailContent = `
    Congratulations! Your internship posting "${internship.jobTitle}" has been approved!
    Company: ${internship.companyName}
    Location: ${internship.location}
    Description: ${internship.jobDescription}
    Start Date: ${internship.startDate}
    End Date/Duration: ${internship.endDateOrDuration}
  `;

  const mailOptions = {
    from: "skillnaav@gmail.com",
    to: to,
    subject: subject,
    text: emailContent,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
