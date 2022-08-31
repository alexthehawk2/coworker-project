const coWorker = require("../models/coworker");

module.exports.getSpaces = async (req, res) => {
  const spaces = await coWorker.find();
  console.log(req.session);
  res.render("spaces", { title: "Coworking Space Locations", spaces });
};
module.exports.getNewSpaceForm = (req, res) => {
  res.render("new", { title: "Create new space" });
};
module.exports.postSpaces = async (req, res, next) => {
  const space = new coWorker({
    title: req.body.name,
    location: `${req.body.city}, ${req.body.state}`,
    image: req.body.imageUrl,
    description: req.body.description,
    price: req.body.price,
    spaceOwner: req.user._id,
  });
  await space.save();
  req.flash("success", "Successfully created new space");
  res.redirect(`/spaces/${space.id}`);
};
module.exports.showSpace = async (req, res, next) => {
  console.log(req.session);
  const space = await coWorker
    .findById(req.params.id)
    .populate("spaceOwner")
    // .populate({ path: "reviews", populate: { path: "reviewedBy" } });
    .populate("reviews");
  if (!space) {
    req.flash("error", "Space not found!");
    return res.redirect("/spaces");
  }
  res.render("show", { title: `${space.title} Details`, space });
};
module.exports.editSpaceForm = async (req, res, next) => {
  const id = req.params.id;
  const space = await coWorker.findById(id);
  if (!space) {
    req.flash("error", "Space not found!");
    return res.redirect("/spaces");
  }
  const locArr = space.location.split(", ");
  res.render("edit", { title: `Edit ${space.title}`, space, locArr });
};
module.exports.editSpace = async (req, res, next) => {
  const space = {
    title: req.body.name,
    location: `${req.body.city}, ${req.body.state}`,
    price: req.body.price,
    description: req.body.description,
    image: req.body.imageUrl,
  };
  await coWorker.findByIdAndUpdate(req.params.id, space);
  req.flash("success", "Edited successfully");
  res.redirect(`/spaces/${req.params.id}`);
};
module.exports.deleteSpace = async (req, res) => {
  await coWorker.findByIdAndDelete(req.params.id);
  req.flash("success", "Deleted successfully");
  res.redirect("/spaces");
};
