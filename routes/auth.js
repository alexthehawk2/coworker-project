const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("../models/user");
const asyncErrorWrapper = require("../utils/asyncErrorWrapper");
const router = express.Router();

router.get("/login", (req, res) => {
  if(req.isAuthenticated()){
    req.flash('error', 'You are already signed in!.')
    return res.redirect('/spaces')
  }
  res.render("./auth/login");
});
router.get("/register", (req, res) => {
  if(req.isAuthenticated()){
    req.flash('error', 'You are already signed in with an account!.')
    return res.redirect('/spaces')
  }
  res.render("./auth/register");
});
router.post(
  "/register",
  asyncErrorWrapper(async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    const result = await User.register({ username }, password);
    console.log(result);
    req.flash("success", "Account created successfully, please login.");
    res.redirect("/login");
  })
);
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    successFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Successfully logged in.");
    res.redirect("/spaces");
  }
);

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Successfully logged out.");
    res.redirect("/spaces");
  });
});

module.exports = router;
