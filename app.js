const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const coworker = require("./models/coworker");
const coWorker = require("./models/coworker");
mongoose.connect("mongodb://localhost:27017/coworker").then(() => {
  console.log("database connected");
});
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.send("hello");
});
app.get("/spaces", async (req, res) => {
  const spaces = await coWorker.find();
  res.render("spaces", { title: "Coworking Space Locations", spaces });
});
app.get("/spaces/new", (req, res) => {
  res.render("new", { title: "Create new space" });
});
app.post("/spaces", (req, res) => {
  const space = {
    title: req.body.name,
    location: `${req.body.city}, ${req.body.state}`,
  };
  coWorker.insertMany([space]).then((data) => {
    res.redirect(`/spaces/${data[0].id}`);
  });
});
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
  };
  await coWorker.findByIdAndUpdate(req.params.id, space);
  res.redirect(`/spaces/${req.params.id}`);
});
app.delete("/spaces/:id", async (req, res) => {
  await coWorker.findByIdAndDelete(req.params.id);
  res.redirect("/spaces");
});
app.listen(3001, () => {
  console.log("started on port 3001");
});
