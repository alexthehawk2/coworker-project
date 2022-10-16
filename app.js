require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const AppError = require("./utils/AppError");
const spaces = require("./routes/spaces");
const reviews = require("./routes/review");
const auth = require("./routes/auth");
const passport = require("passport");
const User = require("./models/user");
const uri =
  "mongodb+srv://" +
  process.env.MONGODB_USERNAME_PASSWORD +
  "@cluster0.z6cz7.mongodb.net/coworker?retryWrites=true&w=majority";
mongoose
  .connect(uri)
  .then(console.log("database connected"))
  .catch((err) => {
    console.log("Error ", err);
  });
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(mongoSanitize());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://getbootstrap.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/alexthehawk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
const store = MongoStore.create({
  mongoUrl: uri,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
});
store.on("error", (e) => {
  console.log("Session Store Error", e);
});
const sessionOptions = {
  name: "session",
  resave: false,
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true
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
  // res.redirect("/spaces");
  res.render("home");
});
//auth route
app.use("/", auth);
//space route
app.use("/spaces", spaces);
//review route
app.use("/spaces/:id/reviews", reviews);
app.get("/upload", (req, res) => {
  res.render("upload", { title: "Upload" });
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
    err.message = `${err.path === "reviews" ? "Review" : "Space"} not found`;
  }
  if (err.name === "MulterError") {
    statusCode = 400;
    err.message = `Image too large(image file size should lower than 10mb)`;
  }
  res.status(statusCode).render("error", {
    title: `Oh no! ${err.statusCode} Error`,
    err,
    link: link,
  });
});
app.listen(process.env.PORT || 3000, () => {
  console.log("started on port 3000");
});
