const mongoose = require("mongoose");
const Joi = require("joi");

const cardSchema = new mongoose.Schema({
  cardname: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  image: {
    type: String,
    minLength: 11,
    maxLength: 1024,
  },
  description: {
    type: String,
    required: true,
    minLength: 10,
    maxlength: 1024,
  },
  category: {
    type: String,
    minLength: 2,
    maxLength: 255,
    required: true,
  },
  condition: {
    type: String,
    enum: ["Mint", "Near Mint", "Very Good", "Good", "Fair", "Poor"],
    default: "Mint",
  },
  rarity: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 22,
  },
  amount: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cardCollection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cardCollection",
  },
});

const Card = mongoose.model("Card", cardSchema, "cards");

const validateCard = (card) => {
  const schema = Joi.object({
    cardname: Joi.string().min(2).max(255).required(),
    image: Joi.string().min(11).max(1024).uri(),
    description: Joi.string().min(2).max(1024).required(),
    category: Joi.string().required(),
    condition: Joi.string()
      .valid("Mint", "Near Mint", "Very Good", "Good", "Fair", "Poor")
      .required(),
    rarity: Joi.string().required().min(2).max(22),
    category: Joi.string().required().min(2).max(255),
  });

  return schema.validate(card);
};

module.exports = { Card, validateCard };
