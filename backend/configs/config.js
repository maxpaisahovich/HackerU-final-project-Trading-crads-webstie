module.exports = {
  JWTSecretToken: process.env.JWT_SECRET_TOKEN || "NOT_VERY_SECRETIVE",
  GoogleClientId: process.env.GOOGLE_CLIENT_ID,
  GoogleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  SessionSecret: process.env.SESSION_SECRET,
  SendGridKey: process.env.SENDGRID_API_KEY,
};
