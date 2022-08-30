const express = require("express");
const coWorker = require("../models/coWorker");
const AppError = require("../utils/AppError");
const connectEnsureLogin = require("connect-ensure-login");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const { joiCoworkerSchema } = require("../validators/validator");
const { isLoggedIn, isOwner } = require("../authMiddleware");
const router = express.Router();

const spaceValidation = (req, res, next) => {
  const validationResult = joiCoworkerSchema.validate(req.body);
  if (validationResult.error) {
    throw new AppError(`${validationResult.error.details[0].message}`, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  asyncErrorWrapper(async (req, res) => {
    const spaces = await coWorker.find();
    console.log(req.session);
    res.render("spaces", { title: "Coworking Space Locations", spaces });
  })
);
router.get("/new", isLoggedIn, (req, res) => {
  res.render("new", { title: "Create new space" });
});
router.post(
  "/",
  isLoggedIn,
  spaceValidation,
  asyncErrorWrapper(async (req, res, next) => {
    const space = new coWorker({
      title: req.body.name,
      location: `${req.body.city}, ${req.body.state}`,
      image: req.body.imageUrl,
      description: req.body.description,
      price: req.body.price,
      spaceOwner: req.user._id,
    });
    await space.save();
    req.flash("success", "Successfully created new space");
    res.redirect(`/spaces/${space.id}`);
  })
);
router.get(
  "/:id",
  asyncErrorWrapper(async (req, res, next) => {
    console.log(req.session);
    const space = await coWorker
      .findById(req.params.id)
      .populate("spaceOwner")
      // .populate({ path: "reviews", populate: { path: "reviewedBy" } });
      .populate("reviews");
    if (!space) {
      req.flash("error", "Space not found!");
      return res.redirect("/spaces");
    }
    res.render("show", { title: `${space.title} Details`, space });
  })
);
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  asyncErrorWrapper(async (req, res, next) => {
    const id = req.params.id;
    const space = await coWorker.findById(id);
    if (!space) {
      req.flash("error", "Space not found!");
      return res.redirect("/spaces");
    }
    const locArr = space.location.split(", ");
    res.render("edit", { title: `Edit ${space.title}`, space, locArr });
  })
);
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  spaceValidation,
  asyncErrorWrapper(async (req, res, next) => {
    const space = {
      title: req.body.name,
      location: `${req.body.city}, ${req.body.state}`,
      price: req.body.price,
      description: req.body.description,
      image: req.body.imageUrl,
    };
    await coWorker.findByIdAndUpdate(req.params.id, space);
    req.flash("success", "Edited successfully");
    res.redirect(`/spaces/${req.params.id}`);
  })
);
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  asyncErrorWrapper(async (req, res) => {
    await coWorker.findByIdAndDelete(req.params.id);
    req.flash("success", "Deleted successfully");
    res.redirect("/spaces");
  })
);

module.exports = router;
