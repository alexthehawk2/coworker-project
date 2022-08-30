const coWorker = require("./models/coworker");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Please sign in before accessing it");
    return res.redirect("/login");
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const space = await coWorker.findById(id).populate("spaceOwner");
  if (space && space.spaceOwner.id !== req.user.id) {
    req.flash("error", "You don't have permission to perform this action");
    delete req.session.returnTo;
    return res.redirect(`/spaces/${space.id}`);
  }
  next();
};
module.exports.isReviewOwner = async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId).populate("reviewedBy");
  if (!review || req.user.id !== review.reviewedBy.id) {
    req.flash("error", "You don't have permission to perform this action");
    return res.redirect(`/spaces/${id}`);
  }
  next();
};
