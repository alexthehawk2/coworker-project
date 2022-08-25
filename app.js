const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const AppError = require("./utils/AppError");
const spaces = require("./routes/spaces");
const reviews = require("./routes/review");
mongoose.connect("mongodb://localhost:27017/coworker").then(() => {
  console.log("database connected");
});

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static('public'))
const sessionOptions = {
  resave: false,
  secret: "testsecret",
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash('error')
  next();
});
//space route
app.use("/spaces", spaces);
//review route
app.use("/spaces/:id/reviews", reviews);
app.get("/", (req, res) => {
  res.redirect("/spaces");
});

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
    err.message = `${err.path==='reviews'?'Review':'Space'} not found`;
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
