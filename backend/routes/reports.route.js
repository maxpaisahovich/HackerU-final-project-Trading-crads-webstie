const express = require("express");
const router = express.Router();

const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

const { Report, validateReport } = require("../models/reports.schema");

// route for creating report on a post
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = validateReport(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const report = new Report({
      ...req.body,
      user: req.user._id,
      post: req.body.post,
    });

    await report.save();

    res.send(report);
  } catch (error) {
    next(error);
  }
});

//get all reports for a user
router.get("/my-reports", authenticate, async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id });

    res.send(reports);
  } catch (error) {
    next(error);
  }
});

// get all reports
router.get("/all", authenticate, async (req, res, next) => {
  try {
    const reports = await Report.find({}).sort({ date: -1 });

    res.send(reports);
  } catch (error) {
    next(error);
  }
});

// route to delete reports by id
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const report = await Report.findByIdAndRemove(req.params.id);

    if (!report) return res.status(404).send("Report not found.");
    res.send(report);
  } catch (error) {
    next(error);
  }
});

//route to update the isResolved status and set the resolvedAt date for a specific report
router.put("/:id/resolve", authenticate, async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).send("Report not found.");

    report.isResolved = true;
    report.resolvedAt = new Date();

    await report.save();
    res.send(report);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
