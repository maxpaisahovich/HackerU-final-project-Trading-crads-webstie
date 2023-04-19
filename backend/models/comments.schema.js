const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1000,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  image: {
    type: String,
    minLength: 11,
    maxLength: 1024,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model("Comment", commentSchema, "comments");

function validateComment(comment) {
  const schema = Joi.object({
    text: Joi.string().min(1).max(1000).required(),
    image: Joi.string().min(11).max(1024),
  });

  return schema.validate(comment);
}

module.exports = {
  Comment,
  validateComment,
};
