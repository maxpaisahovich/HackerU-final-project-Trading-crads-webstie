const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });
const upload = require("../middleware/multerHandler");

const { User, validateUser } = require("../models/user.schema");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../middleware/sendGridHelper");

// Route for user registration
router.post("/", upload.single("profileImage"), async (req, res, next) => {
  try {
    // Validate user input
    const { error } = validateUser(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    // Check if the user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      const err = new Error("User already registered.");
      err.statusCode = 400;
      throw err;
    }

    // Create a new user
    user = new User({
      ...req.body,
      profileImage: req.file ? req.file.path : null,
      password: await bcrypt.hash(req.body.password, 12),
    });

    // Generate the verification token
    const token = user.getVerificationToken();

    //saves the user and Send the email verification email
    await Promise.all([user.save(), sendVerificationEmail(user.email, token)]);

    // Send the user data in the response
    res.send(
      _.pick(user, ["_id", "username", "email", "role", "profileImage"])
    );
  } catch (error) {
    next(error);
  }
});

// get logged users info
router.get("/profile", authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id, { password: 0 });
    if (!user) {
      const err = new Error("User not found.");
      err.statusCode = 404;
      throw err;
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// Route for updating user information
router.put(
  "/profile",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // Find the user
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).send("User not found.");
      }

      // Update username if provided
      if (username) {
        user.username = username;
      }

      // Update email if provided
      if (email) {
        user.email = email;
      }

      // Update password if provided
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      // Update profile image if provided
      if (req.file) {
        user.profileImage = req.file.path;
      }

      // Save the updated user information
      await user.save();

      res
        .status(200)
        .send(_.pick(user, ["_id", "username", "email", "profileImage"]));
    } catch (error) {
      next(error);
    }
  }
);

// Route for email verification
router.get("/verify-email/:token", async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      const err = new Error("Invalid or expired verification token.");
      err.statusCode = 400;
      throw err;
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiration = undefined;

    await user.save();
    res.status(200).send("Email verified successfully.");
  } catch (error) {
    next(error);
  }
});

// Route for password reset request
router.post("/request-password-reset", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const err = new Error("User not found.");
      err.statusCode = 404;
      throw err;
    }

    const token = user.getPasswordResetToken();
    user.passwordResetToken = token;
    user.passwordResetTokenExpiration = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    await sendPasswordResetEmail(user.email, token);

    res.status(200).send("Password reset email sent.");
  } catch (error) {
    next(error);
  }
});

// Route for password reset
router.post("/reset-password/:token", async (req, res, next) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      const err = new Error("Invalid or expired password reset token.");
      err.statusCode = 400;
      throw err;
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiration = undefined;
    await user.save();

    res.status(200).send("Password reset successfully.");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
