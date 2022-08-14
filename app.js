const express = require("express");
const mongoose = require("mongoose");
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

app.get("/", (req, res) => {
  res.redirect("/spaces");
});
app.get("/spaces", async (req, res) => {
  const spaces = await coWorker.find();
  res.render("spaces", { title: "Coworking Space Locations", spaces });
});
app.get("/spaces/new", (req, res) => {
  res.render("new", { title: "Create new space" });
});
app.post(
  "/spaces",
  asyncErrorWrapper(async (req, res, next) => {
    if (
      !req.body.name ||
      !req.body.city ||
      !req.body.state ||
      !req.body.description ||
      !req.body.imageUrl ||
      !req.body.price
    ) {
      throw new AppError("No form data", 400);
    }
    console.log(req.body);
    const { name, city, state, imageUrl, description, price } = req.body;
    const space = new coWorker({
      title: name,
      location: `${city}, ${state}`,
      image: imageUrl,
      description,
      price,
    });
    console.log(space._id);
    await space.save();
    res.redirect(`/spaces/${space._id}`);
  })
);
app.get("/spaces/:id", async (req, res) => {
  const space = await coWorker.findById(req.params.id);
  res.render("show", { title: `${space.title} Details`, space });
});
app.get("/spaces/:id/edit", async (req, res) => {
  const id = req.params.id;
  const space = await coWorker.findById(id);
  const locArr = space.location.split(", ");
  res.render("edit", { title: `Edit ${space.title}`, space, locArr });
});
app.put("/spaces/:id", async (req, res) => {
  const space = {
    title: req.body.name,
    location: `${req.body.city}, ${req.body.state}`,
    price: parseInt(req.body.price),
    description: req.body.description,
    image: req.body.imageUrl,
  };
  await coWorker.findByIdAndUpdate(req.params.id, space);
  res.redirect(`/spaces/${req.params.id}`);
});
app.delete("/spaces/:id", async (req, res) => {
  await coWorker.findByIdAndDelete(req.params.id);
  res.redirect("/spaces");
});
// app.all("*", (req, res, next) => {
//   next(new AppError("Page not found", 404));
// });
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode).send(message);
});
app.listen(3000, () => {
  console.log("started on port 3000");
});
