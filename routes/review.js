const express = require("express");
const { isLoggedIn, isReviewOwner } = require("../authMiddleware");
const { postReview, deleteReview } = require("../controllers/review");
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
router.post("/", isLoggedIn, reviewValidation, asyncErrorWrapper(postReview));
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewOwner,
  asyncErrorWrapper(deleteReview)
);

module.exports = router;
