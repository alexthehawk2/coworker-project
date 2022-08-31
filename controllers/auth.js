const User = require("../models/user");
module.exports.getLogin = (req, res) => {
  if (req.isAuthenticated()) {
    req.flash("error", "You are already signed in!.");
    return res.redirect("/spaces");
  }
  res.render("./auth/login");
};
module.exports.getRegister = (req, res) => {
  if (req.isAuthenticated()) {
    req.flash("error", "You are already signed in with an account!.");
    return res.redirect("/spaces");
  }
  res.render("./auth/register");
};
module.exports.postRegister = async (req, res, next) => {
  const { username, password } = req.body;
  const result = await User.register({ username }, password);
  req.login(result, (err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Account created successfully.");
    res.redirect("/spaces");
  });
};
module.exports.postLogin = (req, res) => {
  const redirectUrl = req.session.returnTo || "/spaces";
  req.flash("success", "Successfully logged in.");
  res.redirect(redirectUrl);
};
module.exports.logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Successfully logged out.");
    res.redirect("/spaces");
  });
};
