const express = require("express");
const router = express.Router();

const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

const {
  CardCollection,
  validateCardCollection,
} = require("../models/cardCollection.schema");
const { Card } = require("../models/card.schema");
const { User } = require("../models/user.schema");

// Create a new collection
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = validateCardCollection(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const collection = new CardCollection({
      ...req.body,
      user: req.user._id,
    });

    await collection.save();

    res.status(201).send(collection);
  } catch (error) {
    next(error);
  }
});

// Get all collections for a user
router.get("/my-collections", authenticate, async (req, res, next) => {
  try {
    const collections = await CardCollection.find({ user: req.user._id });
    res.status(200).send(collections);
  } catch (error) {
    next(error);
  }
});

// Get a collection by ID
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const collection = await CardCollection.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!collection) return res.status(404).send("Collection not found.");
    res.send(collection);
  } catch (error) {
    next(error);
  }
});

// Update a collection by ID
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const { error } = validateCardCollection(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const collection = await CardCollection.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!collection) return res.status(404).send("Collection not found.");
    res.send(collection);
  } catch (error) {
    next(error);
  }
});

// Delete a collection by ID
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const collection = await CardCollection.findOneAndRemove({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!collection) return res.status(404).send("Collection not found.");
    res.send(collection);
  } catch (error) {
    next(error);
  }
});

// Route for adding a card to a collection
router.put("/:id/add-card", authenticate, async (req, res, next) => {
  try {
    const cardId = req.body.cardId;
    console.log("Card ID:", cardId);

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).send("Card not found.");

    let collection = await CardCollection.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!collection) {
      return res.status(404).send("Collection not found.");
    }

    collection.cards.push(card._id);
    await collection.save();

    res.send({
      message: "Card added to the collection successfully.",
      collection,
    });
  } catch (error) {
    next(error);
  }
});

// Route for removing a card from a collection
router.put("/:id/remove-card", authenticate, async (req, res, next) => {
  try {
    const card = await Card.findById(req.body.cardId);
    if (!card) return res.status(404).send("Card not found.");

    let collection = await CardCollection.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!collection) {
      return res.status(404).send("Collection not found.");
    }

    collection.cards.pull(card._id);
    await collection.save();

    res.send({
      message: "Card removed from the collection successfully.",
      collection,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
