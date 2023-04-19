const mongoose = require("mongoose");
const Joi = require("joi");

const reportSchema = new mongoose.Schema({
  subject: {
    type: String,
    minLength: 2,
    maxLength: 255,
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model("Report", reportSchema, "reports");

function validateReport(report) {
  const schema = Joi.object({
    subject: Joi.string().required().min(2).max(255),
    reason: Joi.string().required(),
    post: Joi.string().required(),
  });

  return schema.validate(report);
}

module.exports = {
  Report,
  validateReport,
};
