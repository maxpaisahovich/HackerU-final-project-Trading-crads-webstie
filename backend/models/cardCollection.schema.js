const mongoose = require("mongoose");
const Joi = require("joi");

const cardCollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 255,
    required: true,
  },
  category: {
    type: String,
    minLength: 2,
    maxLength: 255,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
  ],
});

const CardCollection = mongoose.model(
  "CardCollection",
  cardCollectionSchema,
  "cardCollections"
);

function validateCardCollection(cardCollection) {
  const schema = Joi.object({
    category: Joi.string().min(3).max(255).required(),
    name: Joi.string().min(3).max(255).required(),
  });

  return schema.validate(cardCollection);
}

module.exports = {
  CardCollection,
  validateCardCollection,
};
