const passport = require("passport");
const express = require("express");
const router = express.Router();

const joi = require("joi");
const bcrypt = require("bcryptjs");

const { User } = require("../models/user.schema");

router.post("/", async (req, res) => {
  // validate user input
  const { error } = validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  // validate system requirements
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 400;
    throw err;
  }

  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isValidPassword) {
    const err = new Error("Invalid email or password");
    err.statusCode = 400;
    throw err;
  }
  // process
  const token = user.generateAuthToken();

  // response
  res.send({ token });
});

// Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  (req, res) => {
    // Generate a JWT token and send it as a response
    const token = req.user.generateAuthToken();
    res.send({ token });
  }
);

function validate(user) {
  const schema = joi.object({
    email: joi.string().min(6).max(255).email().required(),
    password: joi.string().min(6).max(255).required(),
  });

  return schema.validate(user);
}

module.exports = router;
