const sgMail = require("@sendgrid/mail");
const { SendGridKey } = require("../configs/config");

sgMail.setApiKey(SendGridKey);

const sendVerificationEmail = async (to, token) => {
  try {
    const msg = {
      to,
      from: "trading.cards.email@gmail.com",
      subject: "Email Verification",
      text: `Please click the link below to verify your email: https://localhost:3900/Trading-cards-website/users/verify-email/${token}`,
      html: `<p>Please click the link below to verify your email:</p><a href="https://localhost:3900/Trading-cards-website/users/verify-email/${token}">Verify Email</a>`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

const sendPasswordResetEmail = async (to, token) => {
  try {
    const msg = {
      to,
      from: "trading.cards.email@gmail.com",
      subject: "Password Reset",
      text: `Please click the link below to reset your password: https://localhost:3900/Trading-cards-website/users/reset-password/${token}`,
      html: `<p>Please click the link below to reset your password:</p><a href="https://localhost:3900/Trading-cards-website/users/reset-password/${token}">Reset Password</a>`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
