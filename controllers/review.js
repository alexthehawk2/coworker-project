const coWorker = require("../models/coworker");
const Review = require("../models/review");
module.exports.postReview = async (req, res) => {
  const space = await coWorker.findById(req.params.id);
  let { review } = req.body;
  review = new Review(review);
  space.reviews.push(review);
  await space.save();
  review.reviewedBy = req.user.id;
  await review.save();
  req.flash("success", "Review Added successfully");
  res.redirect(`/spaces/${req.params.id}`);
};
module.exports.deleteReview = async (req, res) => {
  await coWorker.findByIdAndUpdate(req.params.id, {
    $pull: { reviews: req.params.reviewId },
  });
  await Review.findByIdAndDelete(req.params.id);
  req.flash("success", "Review deleted");
  res.redirect(`/spaces/${req.params.id}`);
};
