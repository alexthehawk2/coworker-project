const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const AppError = require("./utils/AppError");
const LocalStrategy = require("passport-local");
const spaces = require("./routes/spaces");
const reviews = require("./routes/review");
const auth = require("./routes/auth");
const passport = require("passport");
const User = require("./models/user");

mongoose.connect("mongodb://localhost:27017/coworker").then(() => {
  console.log("database connected");
});

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

const sessionOptions = {
  resave: false,
  secret: "testsecret",
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24,
  },
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.isLoggedIn = true;
    res.locals.userInfo = req.user;
  } else {
    res.locals.isLoggedIn = false;
    res.locals.userInfo = false;
  }
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.redirect("/spaces");
});
//auth route
app.use("/", auth);
//space route
app.use("/spaces", spaces);
//review route
app.use("/spaces/:id/reviews", reviews);

//error handling middlewares
app.all("*", (req, res, next) => {
  next(new AppError("Page not found!", 404));
});
app.use((err, req, res, next) => {
  let errUrl = req.originalUrl;
  errUrl = errUrl.split("?");
  let link = "";
  if (req.method === "PUT") {
    link = errUrl[0] + "/edit";
  } else {
    link = "/spaces/new";
  }
  let { statusCode = 500, message = "something went wrong" } = err;
  if (err.name === "ValidationError") {
    statusCode = 400;
    err.message = "Price must be a number and greater than 0";
  }
  if (err.name === "CastError") {
    statusCode = 404;
    err.message = `${err.path === "reviews" ? "Review" : "Space"} not found`;
  }
  res.status(statusCode).render("error", {
    title: `Oh no! ${err.statusCode} Error`,
    err,
    link: link,
  });
});
app.listen(3000, () => {
  console.log("started on port 3000");
});
