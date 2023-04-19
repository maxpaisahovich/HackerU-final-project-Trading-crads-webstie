const mongoose = require("mongoose");
const Joi = require("joi");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: String,
    minLength: 2,
    maxLength: 255,
    required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
  },
  type: {
    type: String,
    enum: ["Sell", "Trade", "Buy", "Show"],
    required: true,
  },
  image: {
    type: String,
    required: false,
    minLength: 11,
    maxLength: 1024,
  },
  likes: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", postSchema, "posts");

const validatePost = (post) => {
  const schema = Joi.object({
    subject: Joi.string().min(2).max(255).required(),
    content: Joi.string().min(1).max(500).required(),
    type: Joi.string().valid("Sell", "Trade", "Buy", "Show").required(),
  });

  return schema.validate(post);
};

module.exports = { validatePost, Post };
