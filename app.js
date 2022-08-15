const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const { joiCoworkerSchema } = require("./validators/crudEval");
const methodOverride = require("method-override");
const coWorker = require("./models/coworker");
const asyncErrorWrapper = require("./utils/asyncErrorWrapper");
const AppError = require("./utils/AppError");
mongoose.connect("mongodb://localhost:27017/coworker").then(() => {
  console.log("database connected");
});
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const spaceValidation = (req, res, next) => {
  const validationResult = joiCoworkerSchema.validate(req.body);
  if (validationResult.error) {
    throw new AppError(`${validationResult.error.details[0].message}`, 400);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.redirect("/spaces");
});
app.get(
  "/spaces",
  asyncErrorWrapper(async (req, res) => {
    const spaces = await coWorker.find();
    res.render("spaces", { title: "Coworking Space Locations", spaces });
  })
);
app.get("/spaces/new", (req, res) => {
  res.render("new", { title: "Create new space" });
});
app.post(
  "/spaces",
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
    res.redirect(`/spaces/${space.id}`);
  })
);
app.get(
  "/spaces/:id",
  asyncErrorWrapper(async (req, res, next) => {
    const space = await coWorker.findById(req.params.id);
    if (space === null) {
      throw new AppError("Invalid Space, not found", 404);
    }
    res.render("show", { title: `${space.title} Details`, space });
  })
);
app.get(
  "/spaces/:id/edit",
  asyncErrorWrapper(async (req, res, next) => {
    const id = req.params.id;
    const space = await coWorker.findById(id);
    const locArr = space.location.split(", ");
    res.render("edit", { title: `Edit ${space.title}`, space, locArr });
  })
);
app.put(
  "/spaces/:id",
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
app.delete("/spaces/:id", async (req, res) => {
  await coWorker.findByIdAndDelete(req.params.id);
  res.redirect("/spaces");
});
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
  res.status(statusCode).render("error", {
    title: `Oh no! ${err.statusCode} Error`,
    err,
    link: link,
  });
});
app.listen(3000, () => {
  console.log("started on port 3000");
});
