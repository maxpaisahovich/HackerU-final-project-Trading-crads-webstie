const express = require("express");
const router = express.Router();

const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

const upload = require("../middleware/multerHandler");

const { Card, validateCard } = require("../models/card.schema");

// Create a new card
router.post(
  "/",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      // Validate request body
      const { error } = validateCard(req.body);
      if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
      }

      const card = new Card({
        ...req.body,
        user: req.user._id,
        image: req.file ? req.file.path : null,
      });

      await card.save();

      res.status(201).send(card);
    } catch (error) {
      next(error);
    }
  }
);

// Get all cards
router.get("/my-cards", authenticate, async (req, res, next) => {
  try {
    const cards = await Card.find({ user: req.user._id });
    res.status(200).send(cards);
  } catch (error) {
    next(error);
  }
});

// Route for fetching card by id
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const card = await Card.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!card) return res.status(404).send("Card not found.");
    res.send(card);
  } catch (error) {
    next(error);
  }
});

// Route for updating a card
router.put(
  "/:id",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const card = await Card.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
          profileImage: req.file ? req.file.path : null,
        },
        req.body,
        { new: true }
      );

      if (!card) return res.status(404).send("Card not found.");
      res.send(card);
    } catch (error) {
      next(error);
    }
  }
);

// Route for deleting a card
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const card = await Card.findOneAndRemove({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!card) return res.status(404).send("Card not found.");

    res.send(card);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
