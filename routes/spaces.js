const express = require("express");
const coWorker = require("../models/coWorker");
const AppError = require("../utils/AppError");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const {joiCoworkerSchema} = require('../validators/validator')
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
    res.render("spaces", { title: "Coworking Space Locations", spaces, message: res.locals.success});
  })
);
router.get("/new", (req, res) => {
  res.render("new", { title: "Create new space" });
});
router.post(
  "/",
  spaceValidation,
  asyncErrorWrapper(async (req, res, next) => {
    const space = new coWorker({
      title: req.body.name,
      location: `${req.body.city}, ${req.body.state}`,
      image: req.body.imageUrl,
      description: req.body.description,
      price: req.body.price,
    });
    await space.save();
    req.flash('success', 'Successfully created new space')
    res.redirect(`/spaces/${space.id}`);
  })
);
router.get(
  "/:id",
  asyncErrorWrapper(async (req, res, next) => {
    const space = await coWorker.findById(req.params.id).populate("reviews");
    if (space === null) {
      throw new AppError("Invalid Space, not found", 404);
    }
    res.render("show", { title: `${space.title} Details`, space, message: res.locals.success});
  })
);
router.get(
  "/:id/edit",
  asyncErrorWrapper(async (req, res, next) => {
    const id = req.params.id;
    const space = await coWorker.findById(id);
    const locArr = space.location.split(", ");
    res.render("edit", { title: `Edit ${space.title}`, space, locArr });
  })
);
router.put(
  "/:id",
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
    res.redirect(`/spaces/${req.params.id}`);
  })
);
router.delete("/:id", async (req, res) => {
  await coWorker.findByIdAndDelete(req.params.id);
  res.redirect("/spaces");
});

module.exports = router