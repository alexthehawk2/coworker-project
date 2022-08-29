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
  asyncErrorWrapper(async (req, res, next) => {
    const { username, password } = req.body;
    const result = await User.register({ username }, password);
    req.login(result, err =>{
      if(err){return next(err)}
      req.flash("success", "Account created successfully.");
      res.redirect("/spaces");
    })
  })
);
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    successFlash: true,
    failureRedirect: "/login",
    keepSessionInfo:true
  }),
  (req, res) => {
    const redirectUrl = req.session.returnTo || '/spaces'
    req.flash("success", "Successfully logged in.");
    res.redirect(redirectUrl)
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
