const express = require("express");
const router = express.Router();

const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

const upload = require("../middleware/multerHandler");

const { Message, validateMessage } = require("../models/privateMessage.schema");

// Create a new private message
router.post(
  "/",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { error } = validateMessage(req.body);
      if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
      }

      const message = new Message({
        ...req.body,
        sender: req.user._id,
        image: req.file ? req.file.path : null,
      });

      await message.save();

      res.status(201).send(message);
    } catch (error) {
      next(error);
    }
  }
);

// Get all messages between two users
router.get("/:userId1/:userId2", authenticate, async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.userId1, receiver: req.params.userId2 },
        { sender: req.params.userId2, receiver: req.params.userId1 },
      ],
    }).sort("date");

    res.status(200).send(messages);
  } catch (error) {
    next(error);
  }
});

// Delete a private message by its ID
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const message = await Message.findOneAndRemove({
      _id: req.params.id,
      sender: req.user._id,
    });

    if (!message) return res.status(404).send("Message not found.");
    res.send(message);
  } catch (error) {
    next(error);
  }
});

// Mark a private message as read by its ID
router.put("/:id/read", authenticate, async (req, res, next) => {
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: req.params.id,
        receiver: req.user._id,
      },
      {
        isRead: true,
        readAt: Date.now(),
      },
      { new: true }
    );

    if (!message) return res.status(404).send("Message not found.");

    res.send(message);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
