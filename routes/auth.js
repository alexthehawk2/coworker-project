const express = require("express");
const passport = require("passport");
const {
  getLogin,
  getRegister,
  postRegister,
  postLogin,
  logout,
} = require("../controllers/auth");
const User = require("../models/user");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const router = express.Router();

router
  .route("/login")
  .get(getLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      successFlash: true,
      failureRedirect: "/login",
      keepSessionInfo: true,
    }),
    postLogin
  );
router
  .route("/register")
  .get(getRegister)
  .post(asyncErrorWrapper(postRegister));

router.get("/logout", logout);

module.exports = router;
