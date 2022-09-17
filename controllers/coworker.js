const coWorker = require("../models/coworker");
const path = require("path");
const cloudinary = require('cloudinary')
const AppError = require("../utils/AppError");
const { imageUpload } = require("../utils/cloundinaryauth");
const coworker = require("../models/coworker");
module.exports.getSpaces = async (req, res) => {
  const spaces = await coWorker.find();
  res.render("spaces", { title: "Coworking Space Locations", spaces });
};
module.exports.getNewSpaceForm = (req, res) => {
  res.render("new", { title: "Create new space" });
};
module.exports.postSpaces = async (req, res, next) => {
  if (!req.files) {
    throw new AppError("Please Provide an image", 400);
  } else {
    try {
      console.log(
        req.files.map((f) => ({
          filename: f.filename,
          url: f.path,
        }))
      );
      console.log(req.files);
      const space = new coWorker({
        title: req.body.name,
        location: `${req.body.city}, ${req.body.state}`,
        description: req.body.description,
        price: req.body.price,
        spaceOwner: req.user._id,
      });
      space.image = req.files.map((f) => ({
        filename: f.filename,
        url: f.path,
      }));

      // const responseUrl = await imageUpload(uploadImagePath);
      // const space = new coWorker({
      //   title: req.body.name,
      //   location: `${req.body.city}, ${req.body.state}`,
      //   image: responseUrl,
      //   description: req.body.description,
      //   price: req.body.price,
      //   spaceOwner: req.user._id,
      // });
      await space.save();
      req.flash("success", "Successfully created new space");
      res.redirect(`/spaces/${space.id}`);
    } catch (error) {
      res.render("error", { err: error, title: "error" });
    }
  }
};
module.exports.showSpace = async (req, res, next) => {
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
  console.log(req.body);
  const space = {
    title: req.body.name,
    location: `${req.body.city}, ${req.body.state}`,
    price: req.body.price,
    description: req.body.description,
  };
  
    const newSpace = await coWorker.findByIdAndUpdate(req.params.id, space);
    const newImages = await newSpace.image.concat(
      req.files.map((f) => ({
        filename: f.filename,
        url: f.path,
      }))
    );
    newSpace.image = newImages;
    await newSpace.save();
    if (req.body.deleteImages) {
      for(let filename of req.body.deleteImages){
        cloudinary.v2.uploader.destroy(filename)
      }
      await newSpace.updateOne({
        $pull: { image: { filename: { $in: req.body.deleteImages } } },
      });
    }
    
  
  req.flash("success", "Edited successfully");
  res.redirect(`/spaces/${req.params.id}`);
};
module.exports.deleteSpace = async (req, res) => {
  const space = await coWorker.findById(req.params.id)
  const imageDelete = []
  for(let image of space.image){
    imageDelete.push(image.filename)
  }

  for(let filename of imageDelete){
    cloudinary.v2.uploader.destroy(filename)
  }
  await coWorker.findByIdAndDelete(req.params.id);
  req.flash("success", "Deleted successfully");
  res.redirect("/spaces");
};
