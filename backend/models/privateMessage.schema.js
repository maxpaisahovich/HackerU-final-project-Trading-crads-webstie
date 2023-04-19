const mongoose = require("mongoose");
const Joi = require("joi");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
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
  text: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1000,
  },
  image: {
    type: String,
    required: false,
    minLength: 11,
    maxLength: 1024,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
});

const Message = mongoose.model("Message", messageSchema, "messages");

function validateMessage(message) {
  const schema = Joi.object({
    subject: Joi.string().min(2).max(1024).required(),
    text: Joi.string().min(2).max(1000).required(),
    receiver: Joi.string().required(),
  });

  return schema.validate(message);
}

module.exports = {
  Message,
  validateMessage,
};
