const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { JWTSecretToken } = require("../configs/config");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 255,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 6,
    maxLength: 255,
  },
  password: {
    type: String,
    minLength: 8,
    maxLength: 1024,
    required: function () {
      return !this.googleId;
    },
  },
  profileImage: {
    type: String,
    minLength: 11,
    maxLength: 1024,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpiration: {
    type: Date,
    default: Date.now,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  googleId: String,
});

userSchema.methods.generateAuthToken = function () {
  try {
    const token = jwt.sign({ _id: this._id, role: this.role }, JWTSecretToken, {
      expiresIn: "1h",
    });
    return token;
  } catch (error) {
    throw new Error("Could not generate auth token");
  }
};

userSchema.methods.getVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = token;

  // Set the token expiration to 1 hour from now
  const expiresIn = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
  this.verificationTokenExpiration = new Date(Date.now() + expiresIn);

  return token;
};

userSchema.methods.getPasswordResetToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  return token;
};

const User = mongoose.model("User", userSchema, "users");

const validateUser = (user) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().min(6).max(255).required(),
    password: Joi.string().min(8).max(1024).required(),
    role: Joi.string(),
  });

  return schema.validate(user);
};

module.exports = { User, validateUser };
