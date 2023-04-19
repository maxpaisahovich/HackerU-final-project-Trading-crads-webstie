const express = require("express");
const router = express.Router();

const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

const upload = require("../middleware/multerHandler");

const { Comment, validateComment } = require("../models/comments.schema");
const { Post } = require("../models/posts.schema");

// Create a new comment
router.post(
  "/post/:postId",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const { error } = validateComment(req.body);

      if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
      }

      const post = await Post.findById(postId);
      if (!post) return res.status(404).send("Post not found.");

      const comment = new Comment({
        ...req.body,
        user: req.user._id,
        post: postId,
        image: req.file ? req.file.path : null,
      });

      await comment.save();
      res.status(201).send(comment);
    } catch (error) {
      next(error);
    }
  }
);

// Get comments
router.get("/post/:postId", authenticate, async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ post: postId }).sort({
      createdAt: -1,
    });

    if (!comments)
      return res.status(404).send("No comments found for this post.");

    res.status(200).send(comments);
  } catch (error) {
    next(error);
  }
});

// Update a comment by its ID
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const { error } = validateComment(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const comment = await Comment.findByIdAndUpdate(
      { _id: commentId, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!comment) return res.status(404).send("Comment not found.");

    comment.text = req.body.text;
    comment.image = req.body.image;

    await comment.save();

    res.status(200).send(comment);
  } catch (error) {
    next(error);
  }
});

// Delete a comment by its ID
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findByIdAndRemove({
      _id: commentId,
      user: req.user._id,
    });

    if (!comment) return res.status(404).send("Comment not found.");

    res.status(200).send({ message: "Comment deleted successfully.", comment });
  } catch (error) {
    next(error);
  }
});

// Route for handling likes
router.put("/:id/like", authenticate, async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      { _id: req.params.id },
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!comment) return res.status(404).send("Comment not found.");

    res.send(comment);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
