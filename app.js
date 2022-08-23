const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const { joiCoworkerSchema } = require("./validators/crudEval");
const {joiReviewSchema} = require("./validators/reviewVal")
const methodOverride = require("method-override");
const coWorker = require("./models/coWorker");
const asyncErrorWrapper = require("./utils/asyncErrorWrapper");
const AppError = require("./utils/AppError");
const Review = require("./models/review");
const { ref } = require("joi");
const spaces = require('./routes/spaces')
mongoose.connect("mongodb://localhost:27017/coworker").then(() => {
  console.log("database connected");
});
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//validator functions
const reviewValidation = (req,res,next)=>{
  const validationResult = joiReviewSchema.validate(req.body)
  if(validationResult.error){
    throw new AppError(`${validationResult.error.details[0].message}`, 400);
  } else {
    next();
  }
}
app.use('/spaces', spaces)
app.get("/", (req, res) => {
  res.redirect("/spaces");
});
  //reviews route
app.post('/spaces/:id/reviews', reviewValidation,asyncErrorWrapper(async(req,res)=>{
  const space = await coWorker.findById(req.params.id)
  let {review } = req.body
  review = new Review(review)
  space.reviews.push(review)
  await space.save()
  await review.save()
  res.redirect(`/spaces/${req.params.id}`)
}))
app.delete('/spaces/:id/reviews/:reviewId', async (req,res)=>{
  await coWorker.findByIdAndUpdate(req.params.id,{$pull:{reviews: req.params.reviewId}})
  await Review.findByIdAndDelete(req.params.id)
  res.redirect(`/spaces/${req.params.id}`)
})
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
  if (err.name === "CastError"){
    statusCode = 404
    err.message = "Space not found"
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
