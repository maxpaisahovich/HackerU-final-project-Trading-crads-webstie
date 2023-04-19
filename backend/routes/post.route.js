const express = require("express");
const router = express.Router();

const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

const upload = require("../middleware/multerHandler");

const { Post, validatePost } = require("../models/posts.schema");

// Create a new post
router.post(
  "/",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { error } = validatePost(req.body);
      if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
      }

      const post = new Post({
        ...req.body,
        user: req.user._id,
        image: req.file ? req.file.path : null,
      });

      await post.save();

      res.status(201).send(post);
    } catch (error) {
      next(error);
    }
  }
);

// Get all user posts
router.get("/my-posts", authenticate, async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.user._id });
    res.status(200).send(posts);
  } catch (error) {
    next(error);
  }
});

// Get all posts
router.get("/all", authenticate, async (req, res, next) => {
  try {
    const posts = await Post.find({}).sort({ date: -1 });

    res.status(200).send(posts);
  } catch (error) {
    next(error);
  }
});

// Get a post by its ID
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!post) return res.status(404).send("Post not found.");
    res.send(post);
  } catch (error) {
    next(error);
  }
});

// Update a post by its ID
router.put(
  "/:id",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const post = await Post.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
          image: req.file ? req.file.path : null,
        },
        req.body,
        { new: true }
      );

      if (!post) return res.status(404).send("Post not found.");
      res.send(post);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a post by its ID
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const post = await Post.findOneAndRemove({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!post) return res.status(404).send("Post not found.");
    res.send(post);
  } catch (error) {
    next(error);
  }
});

// route for handling likes
router.put("/:id/like", authenticate, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      { _id: req.params.id },
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) return res.status(404).send("Post not found.");

    res.send(post);
  } catch (error) {
    next(error);
  }
});

// route for handling views
router.put("/:id/view", authenticate, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      { _id: req.params.id },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!post) return res.status(404).send("Post not found.");

    res.send(post);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
