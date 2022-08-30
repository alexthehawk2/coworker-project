const express = require("express");
const { isLoggedIn, isReviewOwner } = require("../authMiddleware");
const coWorker = require("../models/coworker");
const Review = require("../models/review");
const AppError = require("../utils/AppError");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const { joiReviewSchema } = require("../validators/validator");
const router = express.Router({ mergeParams: true });
//validator functions
const reviewValidation = (req, res, next) => {
  const validationResult = joiReviewSchema.validate(req.body);
  if (validationResult.error) {
    throw new AppError(`${validationResult.error.details[0].message}`, 400);
  } else {
    next();
  }
};
router.post(
  "/",
  isLoggedIn,
  reviewValidation,
  asyncErrorWrapper(async (req, res) => {
    const space = await coWorker.findById(req.params.id);
    let { review } = req.body;
    review = new Review(review);
    space.reviews.push(review);
    await space.save();
    review.reviewedBy = req.user.id;
    await review.save();
    req.flash("success", "Review Added successfully");
    res.redirect(`/spaces/${req.params.id}`);
  })
);
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewOwner,
  asyncErrorWrapper(async (req, res) => {
    await coWorker.findByIdAndUpdate(req.params.id, {
      $pull: { reviews: req.params.reviewId },
    });
    await Review.findByIdAndDelete(req.params.id);
    req.flash("success", "Review deleted");
    res.redirect(`/spaces/${req.params.id}`);
  })
);

module.exports = router;
