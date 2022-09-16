const express = require("express");
const coWorker = require("../models/coworker.js");
const AppError = require("../utils/AppError");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const { joiCoworkerSchema } = require("../validators/validator");
const { isLoggedIn, isOwner } = require("../authMiddleware");
const {
  getSpaces,
  getNewSpaceForm,
  postSpaces,
  showSpace,
  editSpaceForm,
  editSpace,
  deleteSpace,
} = require("../controllers/coworker.js");
const upload = require("../uploadMiddleware.js");
const { object } = require("joi");
const router = express.Router();

const spaceValidation = (req, res, next) => {
  const validationResult = joiCoworkerSchema.validate(req.body);
  if (validationResult.error) {
    throw new AppError(`${validationResult.error.details[0].message}`, 400);
  } else {
    next();
  }
};
router
  .route("/")
  .get(asyncErrorWrapper(getSpaces))
  .post(
    isLoggedIn,
    upload.array("image"),
    spaceValidation,
    asyncErrorWrapper(postSpaces)
  );
router.get("/new", isLoggedIn, getNewSpaceForm);
router
  .route("/:id")
  .get(asyncErrorWrapper(showSpace))
  .put(
    isLoggedIn,
    upload.array("image"),
    isOwner,
    spaceValidation,
    asyncErrorWrapper(editSpace)
  )
  .delete(isLoggedIn, isOwner, asyncErrorWrapper(deleteSpace));
router.get("/:id/edit", isLoggedIn, isOwner, asyncErrorWrapper(editSpaceForm));

module.exports = router;
