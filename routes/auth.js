const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("../models/user");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const router = express.Router();

router.get("/register", (req, res) => {
  res.render("./auth/register");
});
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const result = await User.register({ username, active: false }, password);
  console.log(result);
  res.redirect("/login");
});
router.get("/login", (req, res) => {
  res.render("./auth/login");
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/spaces",
  }),
  (req, res) => {
    console.log(req.user);
  }
);
router.get("/logout", (req, res) => {
  req
    .logout(() => {
      req.flash("success", "Logged out successfully");
    })
    .flash("success", "logged out");
  res.redirect("/spaces");
});

module.exports = router;
